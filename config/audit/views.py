from rest_framework import viewsets, status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.permissions import DjangoModelPermissions
from students.models import Etudiant
from .models import ModificationProposee, Historique
from .serializers import HistoriqueSerializer, ModificationProposeeSerializer

# 1. Vue pour l'Historique Global
class HistoriqueViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.DjangoModelPermissions]

    serializer_class = HistoriqueSerializer
    queryset = Historique.objects.all().order_by('-date')
    # Optionnel : Si vous voulez que SEUL l'admin puisse supprimer, 
    # mais que d'autres puissent voir :
    def get_permissions(self):
        if self.action == 'destroy':
            return [permissions.IsAdminUser()]
        return super().get_permissions()
# 2. Vue pour proposer une modification
class ProposerModification(APIView):
    permission_classes = [DjangoModelPermissions]
    # Ici, on vérifie si l'utilisateur a le droit d'ajouter une proposition
    queryset = ModificationProposee.objects.all()

    def post(self, request):
        matricule = request.data.get('matricule')
        etudiant = get_object_or_404(Etudiant, matricule_id=matricule)
        
        champ = request.data.get('champ')
        nouvelle_valeur = request.data.get('nouvelle_valeur')
        ancienne_valeur = getattr(etudiant, champ, "")

        prop = ModificationProposee.objects.create(
            etudiant=etudiant,
            champ=champ,
            ancienne_valeur=ancienne_valeur,
            nouvelle_valeur=nouvelle_valeur,
            propose_par=request.user
        )

        return Response({"message": "Modification envoyée pour validation"}, status=status.HTTP_201_CREATED)

# 3. LA VUE QUI MANQUAIT : Lister les modifications en attente
class ModificationsEnAttente(APIView):
    permission_classes = [DjangoModelPermissions]
    # On ajoute ceci pour que Django sache qu'il doit vérifier les permissions du modèle 'ModificationProposee'
    queryset = ModificationProposee.objects.all()

    def get(self, request):
        propositions = ModificationProposee.objects.filter(statut='EN_ATTENTE')
        serializer = ModificationProposeeSerializer(propositions, many=True)
        return Response(serializer.data)

# 4. Vue pour valider une modification
class ValiderModification(APIView):
    permission_classes = [DjangoModelPermissions]
    queryset = ModificationProposee.objects.all()

    def post(self, request, id):
        # Vérification Admin
        if not request.user.groups.filter(name="ADMIN").exists() and not request.user.is_superuser:
            return Response({"error": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        modif = get_object_or_404(ModificationProposee, id=id)
        if modif.statut != "EN_ATTENTE":
            return Response({"error": "Déjà traitée"}, status=400)

        etudiant = modif.etudiant

        # --- LOGIQUE D'APPLICATION DES CHANGEMENTS ---
        try:
            champ_nom = modif.champ
            nouvelle_valeur = modif.nouvelle_valeur

            # Liste des champs qui sont des ForeignKeys (à compléter selon tes modèles)
            champs_relation = ['annee_academique', 'filiere']

            if champ_nom in champs_relation:
                # On utilise le suffixe _id pour assigner directement l'identifiant numérique
                setattr(etudiant, f"{champ_nom}_id", int(nouvelle_valeur))
            else:
                # Cas standard (nom, prenom, telephone, is_active...)
                # Gestion du booléen si envoyé sous forme de texte
                if nouvelle_valeur.lower() in ['true', 'false']:
                    nouvelle_valeur = nouvelle_valeur.lower() == 'true'
                
                setattr(etudiant, champ_nom, nouvelle_valeur)
            
            etudiant.save()

        except Exception as e:
            return Response({"error": f"Erreur lors de l'application : {str(e)}"}, status=400)


        # Créer l'historique global
        Historique.objects.create(
            utilisateur=request.user,
            action="UPDATE",
            modele="Etudiant",
            objet_id=etudiant.id,
            details=f"Validé: {modif.champ} changé de '{modif.ancienne_valeur}' à '{modif.nouvelle_valeur}'"
        )

        # Marquer comme validé
        modif.statut = 'VALIDE'
        modif.valide_par = request.user
        modif.date_validation = timezone.now()
        modif.save()

        return Response({"message": "Modification validée avec succès"})



class RejeterModification(APIView):
    permission_classes = [DjangoModelPermissions]
    queryset = ModificationProposee.objects.all()
    def post(self, request, id):

        modif = get_object_or_404(ModificationProposee, id=id)

        if modif.statut != "EN_ATTENTE":
            return Response({"error": "Déjà traitée"}, status=400)

        motif = request.data.get("motif")

        if not motif:
            return Response(
                {"error": "Le motif de rejet est obligatoire"},
                status=400
            )
       
        # Marquer comme rejetée
        modif.statut = "REJETE"
        modif.valide_par = request.user
        modif.date_validation = timezone.now()
        modif.motif_rejet = motif
        modif.save()

        # Historique
        Historique.objects.create(
            utilisateur=request.user,
            role_au_moment=request.user.groups.first().name,
            action="REJET",
            modele="Etudiant",
            objet_id=modif.etudiant.id,
            details=f"Rejet modification {modif.champ} : {motif}"
        )

        return Response({"message": "Modification rejetée"})


class MesPropositions(APIView):
   
    permission_classes = [DjangoModelPermissions]
    queryset = ModificationProposee.objects.all()
    def get(self, request):
        propositions = ModificationProposee.objects.filter(
            propose_par=request.user
        ).order_by('-date_proposition')

        serializer = ModificationProposeeSerializer(propositions, many=True)
        return Response(serializer.data)




class SupprimerModification(generics.DestroyAPIView):
    queryset = ModificationProposee.objects.all()
    # Tu peux limiter : seul celui qui a créé la prop ou un ADMIN peut supprimer
    permission_classes = [permissions.IsAuthenticated] 
    lookup_field = 'id'

    def perform_destroy(self, instance):
        # Optionnel : Empêcher la suppression si déjà VALIDÉE
        if instance.statut == 'VALIDE':
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Impossible de supprimer une modification déjà validée.")
        instance.delete()
