from django.db import models

# Create your models here.

class StagingInscription(models.Model):

    nom_brut = models.CharField(max_length=100)
    prenom_brut = models.CharField(max_length=100)
    telephone_brut = models.CharField(max_length=20)
    tuteur_brut = models.CharField(max_length=100, null=True, blank=True)

    statut = models.CharField(
        max_length=20,
        choices=[
            ('EN_ATTENTE', 'En attente'),
            ('VALIDE', 'Validé'),
            ('REJETE', 'Rejeté'),
            ('DOUBLON', 'Doublon suspect'),
        ],
        default='EN_ATTENTE'
    )

    score_doublon = models.FloatField(default=0)
    date_creation = models.DateTimeField(auto_now_add=True)
