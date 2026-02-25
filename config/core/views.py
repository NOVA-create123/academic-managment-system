from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q  # Importation directe de Q et Count
from django.http import HttpResponse
import csv

from students.models import Etudiant
from staging.models import StagingInscription
from audit.models import Historique, HistoriqueFiliere 

class DataQualityDashboard(APIView):
    def get(self, request):
        total_etudiants = Etudiant.objects.filter(is_active=True).count()
        doublons = StagingInscription.objects.filter(statut='DOUBLON').count()
        
        # Correction de la syntaxe : On utilise Q(...) au lieu de models.Q(...)
        incomplets = Etudiant.objects.filter(
            Q(telephone__isnull=True) | Q(telephone='')
        ).count()

        # On utilise le nouveau modèle Historique (le champ est 'date')
        recent_modifications = Historique.objects.filter(
            date__gte=timezone.now() - timedelta(days=7)
        ).count()

        data = {
            "total_etudiants": total_etudiants,
            "doublons_suspects": doublons,
            "dossiers_incomplets": incomplets,
            "modifications_recentes": recent_modifications
        }
        return Response(data)

# Export CSV des étudiants
def export_etudiants_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="etudiants.csv"'

    writer = csv.writer(response)
    writer.writerow(['Matricule', 'Nom', 'Prenom', 'Filière','Telephone', 'statut'])

    etudiants = Etudiant.objects.filter(is_active=True)
    for e in etudiants:
        writer.writerow([e.matricule_id, e.nom, e.prenom,e.filiere.nom_filiere, e.annee.libelle, e.telephone, 'Actif' if e.is_active else 'Inactif'])

    return response

from audit.models import Historique

def export_historique_csv(request):

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="historique.csv"'

    writer = csv.writer(response)
    writer.writerow([
        "Utilisateur",
        "Rôle",
        "Action",
        "Modèle",
        "Objet ID",
        "Détails",
        "Date"
    ])

    logs = Historique.objects.all().order_by('-date_action')

    for log in logs:
        writer.writerow([
            log.utilisateur.username,
            log.role_au_moment,
            log.action,
            log.modele,
            log.objet_id,
            log.details,
            log.date_action.strftime("%d/%m/%Y %H:%M")
        ])

    return response

# Statistiques par filière
class StatsParFiliere(APIView):
    def get(self, request):
        # On enlève temporairement .filter(actif=True) pour vérifier si les données apparaissent
        stats = HistoriqueFiliere.objects.values(
            'filiere__nom_filiere'
        ).annotate(total=Count('etudiant'))
        
        return Response([
            {"filiere": item['filiere__nom_filiere'] or "Inconnue", "total": item['total']} 
            for item in stats
        ])

class StatsParAnneeGlobal(APIView):
    def get(self, request):
        # Cette vue ne demande PAS d'ID, elle renvoie TOUT pour le graphique
        stats = HistoriqueFiliere.objects.values(
            'annee_academique__libelle'
        ).annotate(total=Count('etudiant'))

        return Response([
            {"annee": item['annee_academique__libelle'] or "N/A", "total": item['total']} 
            for item in stats
        ])


# Liste des étudiants par année
class EtudiantsParAnnee(APIView):
    def get(self, request):
        annee_id = request.GET.get('annee')
        if not annee_id:
            return Response({"error": "Paramètre 'annee' manquant"}, status=400)

        data = HistoriqueFiliere.objects.filter(
            annee_academique_id=annee_id,
            actif=True
        ).select_related('etudiant')

        result = [
            {
                "matricule": h.etudiant.matricule_id,
                "nom": h.etudiant.nom,
                "prenom": h.etudiant.prenom,
                "telephone": h.etudiant.telephone
            } for h in data
        ]
        return Response(result)
