from django.db import models
from django.contrib.auth.models import User
from students.models import Etudiant
from references.models import Filiere, AnneeAcademique

# --- 1. MODÈLE GÉNÉRIQUE (L'Audit Global) ---
class Historique(models.Model):
    ACTIONS = (
        ("CREATE", "Création"),
        ("UPDATE", "Modification"),
        ("DELETE", "Suppression"),
        ("VALIDATE", "Validation"),
    )

    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    # On stocke le nom du groupe au moment de l'action (Admin, Scolarité, etc.)
    role_au_moment = models.CharField(max_length=100, null=True, blank=True) 
    action = models.CharField(max_length=10, choices=ACTIONS)
    modele = models.CharField(max_length=100) # Ex: "Etudiant", "Filiere"
    objet_id = models.IntegerField()
    details = models.TextField(null=True, blank=True) # Pour stocker "Nom changé de X à Y"
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.utilisateur} - {self.action} - {self.modele}"

# --- 2. WORKFLOW DE MODIFICATION (Ton code actuel amélioré) ---
class ModificationProposee(models.Model):
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('VALIDE', 'Validée'),
        ('REJETE', 'Rejetée'),
    ]

    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    champ = models.CharField(max_length=50)
    ancienne_valeur = models.CharField(max_length=255)
    nouvelle_valeur = models.CharField(max_length=255)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')

    propose_par = models.ForeignKey(User, related_name='propositions', on_delete=models.CASCADE)
    valide_par = models.ForeignKey(User, null=True, blank=True, related_name='validations', on_delete=models.SET_NULL)

    date_proposition = models.DateTimeField(auto_now_add=True)
    date_validation = models.DateTimeField(null=True, blank=True)

# --- 3. TRAÇABILITÉ DES PARCOURS (Spécifique métier) ---
class HistoriqueFiliere(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    filiere = models.ForeignKey(Filiere, on_delete=models.PROTECT)
    annee_academique = models.ForeignKey(AnneeAcademique, on_delete=models.PROTECT)
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)
    actif = models.BooleanField(default=True, db_index=True)
