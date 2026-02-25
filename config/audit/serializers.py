from rest_framework import serializers
from .models import Historique, HistoriqueFiliere, ModificationProposee

class HistoriqueSerializer(serializers.ModelSerializer):
    # Affiche le nom de l'utilisateur au lieu de son ID simple
    utilisateur_nom = serializers.CharField(source='utilisateur.username', read_only=True)
    # Formate la date pour qu'elle soit plus lisible côté Front-end
    date_formatee = serializers.DateTimeField(source='date', format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = Historique
        fields = [
            'id', 'utilisateur', 'utilisateur_nom', 'role_au_moment', 
            'action', 'modele', 'objet_id', 'details', 'date', 'date_formatee'
        ]

class ModificationProposeeSerializer(serializers.ModelSerializer):
    propose_par_nom = serializers.CharField(source='propose_par.username', read_only=True)
    valide_par_nom = serializers.CharField(source='valide_par.username', read_only=True)
    etudiant_nom = serializers.CharField(source='etudiant.nom', read_only=True)

    class Meta:
        model = ModificationProposee
        fields = '__all__'

class HistoriqueFiliereSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueFiliere
        fields = '__all__'
