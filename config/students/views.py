# Create your views here.
from rest_framework import viewsets, filters,status
from .models import Etudiant
from .serializers import EtudiantSerializer, DossierEtudiantSerializer


from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from references.models import Filiere, AnneeAcademique
from audit.models import HistoriqueFiliere, Historique 

from .services import generate_matricule
from .services import detect_duplicate

from staging.models import StagingInscription
from audit.mixins import AuditMixin
from rest_framework.permissions import DjangoModelPermissions
from django_filters.rest_framework import DjangoFilterBackend
from audit.models import HistoriqueFiliere
from django.utils import timezone
from rest_framework.views import APIView
from students.models import Etudiant
from rest_framework.generics import RetrieveAPIView


class EtudiantViewSet(AuditMixin,viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer
    permission_classes = [DjangoModelPermissions]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    filterset_fields = ['matricule_id', 'telephone']
    search_fields = ['nom', 'prenom']



class EtudiantParAnneeViewSet(AuditMixin, viewsets.ModelViewSet):
    permission_classes = [DjangoModelPermissions]
    def perform_update(self, serializer):
        instance = serializer.save()

        etudiant = instance.etudiant
        nouvelle_filiere = instance.filiere
        annee = instance.annee_academique

        # 1️⃣ Fermer ancienne affectation active
        ancienne = HistoriqueFiliere.objects.filter(
            etudiant=etudiant,
            annee_academique=annee,
            actif=True
        ).first()

        if ancienne and ancienne.filiere != nouvelle_filiere:
            ancienne.actif = False
            ancienne.date_fin = timezone.now()
            ancienne.save()

            # 2️⃣ Créer nouvelle affectation
            HistoriqueFiliere.objects.create(
                etudiant=etudiant,
                filiere=nouvelle_filiere,
                annee_academique=annee,
                actif=True
            )

        # 3️⃣ Audit global
        self.log_action("UPDATE", instance)

#rechercher par filiere et par année
    def get_queryset(self):
        queryset = Etudiant.objects.all()

        filiere = self.request.query_params.get('filiere')
        annee = self.request.query_params.get('annee')

        if filiere:
            queryset = queryset.filter(historiquefiliere__filiere__id=filiere,
                                    historiquefiliere__actif=True)

        if annee:
            queryset = queryset.filter(historiquefiliere__annee_academique__id=annee,
                                    historiquefiliere__actif=True)

        return queryset.distinct()


    """ def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, IsScolariteOrAdmin]
        elif self.action in ['destroy']:
            permission_classes = [IsAuthenticated, IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes] """


    @action(detail=False, methods=['post'])
    @transaction.atomic
    def inscrire(self, request):

        staging = StagingInscription.objects.create(
            nom_brut=nom,
            prenom_brut=prenom,
            telephone_brut=telephone,
            tuteur_brut=tuteur_nom
        )
        staging.statut = 'DOUBLON'
        staging.save()

        
        nom = request.data.get('nom')
        prenom = request.data.get('prenom')
        telephone = request.data.get('telephone')
        tuteur_nom = request.data.get('tuteur_nom')

        filiere_id = request.data.get('filiere_id')
        annee_id = request.data.get('annee_id')

        filiere = Filiere.objects.get(id=filiere_id)
        annee = AnneeAcademique.objects.get(id=annee_id)

        matricule, seq = generate_matricule(annee, filiere)

        etudiant = Etudiant.objects.create(
            matricule_id=matricule,
            numero_sequentiel=seq,
            nom=nom,
            prenom=prenom,
            telephone=telephone,
            tuteur_nom=tuteur_nom
        )

        staging.statut = 'VALIDE'
        staging.save()

        HistoriqueFiliere.objects.create(
            etudiant=etudiant,
            filiere=filiere,
            annee_academique=annee,
            date_debut=annee.libelle[:4] + "-10-01",
            actif=True
        )
        duplicates = detect_duplicate(nom, prenom, telephone)

        if duplicates.exists():
            return Response({
                "warning": "Doublon suspect détecté",
                "suspects": [d.matricule_id for d in duplicates]
            }, status=200)

        return Response({
            "message": "Étudiant inscrit avec succès",
            "matricule": matricule
        })

        
   
#Empêcher la suppresion réelle
    def destroy(self, request, *args, **kwargs):
    # 1. Récupérer l'objet avant de faire quoi que ce soit
        instance = self.get_object()
        
        # 2. Sauvegarder les infos CRUCIALES dans des variables simples
        # (Si on attend après le delete, l'objet instance devient vide/invalide)
        matricule_temp = str(instance.matricule_id)
        nom_temp = f"{instance.nom} {instance.prenom}"
        user_audit = request.user if request.user.is_authenticated else None

        try:
            # 3. Supprimer réellement l'étudiant
            self.perform_destroy(instance)

            # 4. Créer l'historique (Maintenant que l'étudiant est supprimé)
            Historique.objects.create(
                utilisateur=user_audit,
                action="DELETE",
                modele="Etudiant",
                objet_id=0, # L'ID technique n'existe plus
                details=f"Suppression de l'étudiant : {nom_temp} (Matricule: {matricule_temp})"
            )

            return Response(
                {"message": "Étudiant supprimé avec succès"}, 
                status=status.HTTP_204_NO_CONTENT
            )

        except Exception as e:
            # Si l'historique plante, on veut quand même savoir pourquoi
            print(f"Erreur lors de l'audit de suppression : {e}")
            return Response(
                {"error": "Supprimé, mais erreur d'historisation"}, 
                status=status.HTTP_200_OK # On renvoie 200 car l'action principale (delete) a réussi
            )


class DossierEtudiant(APIView):

    def get(self, request, matricule):

        try:
            etudiant = Etudiant.objects.get(matricule_id=matricule)
        except Etudiant.DoesNotExist:
            return Response({"error": "Étudiant introuvable"}, status=404)

        filiere_actuelle = HistoriqueFiliere.objects.filter(
            etudiant=etudiant,
            actif=True
        ).select_related('filiere', 'annee_academique').first()

        historique_modifs = Historique.objects.filter(
            etudiant=etudiant
        ).order_by('-date_modification')

        data = {
            "matricule": etudiant.matricule_id,
            "nom": etudiant.nom,
            "prenom": etudiant.prenom,
            "telephone": etudiant.telephone,
            "tuteur": etudiant.tuteur,

            "filiere_actuelle": filiere_actuelle.filiere.nom_filiere if filiere_actuelle else None,
            "annee_academique": filiere_actuelle.annee_academique.annee if filiere_actuelle else None,

            "historique": [
                {
                    "champ": h.champ_modifie,
                    "ancienne_valeur": h.ancienne_valeur,
                    "nouvelle_valeur": h.nouvelle_valeur,
                    "date": h.date_modification,
                } for h in historique_modifs
            ]
        }

        return Response(data)
    



class DossierEtudiantDetailView(RetrieveAPIView):
    queryset = Etudiant.objects.all()
    serializer_class = DossierEtudiantSerializer
    permission_classes = [DjangoModelPermissions]

    lookup_field = "id" # Tu peux aussi utiliser "matricule_id" si tu préfères
