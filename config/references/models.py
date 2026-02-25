from django.db import models

# Create your models here.

class Filiere(models.Model):
    code_filiere = models.CharField(max_length=10, unique=True)
    nom_filiere = models.CharField(max_length=100)
    departement = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.code_filiere} - {self.nom_filiere}"


class AnneeAcademique(models.Model):
    libelle = models.CharField(max_length=9, unique=True)
    statut = models.CharField(max_length=20)  # Ouverte / Fermée

    def __str__(self):
        return self.libelle
