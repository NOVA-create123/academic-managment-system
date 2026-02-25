from rest_framework import serializers
from .models import Etudiant, EtudiantParAnnee
from references.serializers import FiliereSerializer, AnneeAcademiqueSerializer
class EtudiantSerializer(serializers.ModelSerializer):
    filiere_detail = FiliereSerializer(source='filiere', read_only=True)
    annee_detail = AnneeAcademiqueSerializer(source='annee_academique', read_only=True)
    class Meta:
        model = Etudiant
        fields = '__all__'
        read_only_fields = ['matricule_id', 'numero_sequentiel', 'date_mise_a_jour']
    def create(self, validated_data):
            etudiant = Etudiant.objects.create(**validated_data)

            # Création automatique de la scolarité
            if etudiant.filiere and etudiant.annee_academique:
                EtudiantParAnnee.objects.create(
                    etudiant=etudiant,
                    filiere=etudiant.filiere,
                    annee_academique=etudiant.annee_academique
                )

            return etudiant
        

class ScolariteSerializer(serializers.ModelSerializer):
    filiere = FiliereSerializer()
    annee_academique = AnneeAcademiqueSerializer()

    class Meta:
        model = EtudiantParAnnee
        fields = ["filiere", "annee_academique"]

class DossierEtudiantSerializer(serializers.ModelSerializer):
    scolarite = serializers.SerializerMethodField()

    class Meta:
        model = Etudiant
        fields = [
            "id", "matricule_id", "nom", "prenom", 
            "telephone", "tuteur_nom", "is_active", "scolarite",
        ]

    def get_scolarite(self, obj):
        # On récupère la dernière inscription connue pour cet étudiant
        inscription = EtudiantParAnnee.objects.filter(etudiant=obj).order_by('-date_inscription').first()
        if inscription:
            return ScolariteSerializer(inscription).data
        return None
