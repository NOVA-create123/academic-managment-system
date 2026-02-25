import datetime
from django.db import models

class Etudiant(models.Model):
    matricule_id = models.CharField(max_length=25, unique=True, db_index=True, blank=True)
    nom = models.CharField(max_length=100, db_index=True)
    prenom = models.CharField(max_length=100, db_index=True)
    telephone = models.CharField(max_length=20)
    tuteur_nom = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    filiere = models.ForeignKey('references.Filiere', on_delete=models.PROTECT, related_name="etudiants", null=True)
    annee_academique = models.ForeignKey('references.AnneeAcademique', on_delete=models.PROTECT, null=True)
    
    date_mise_a_jour = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.matricule_id} - {self.nom}"

    def save(self, *args, **kwargs):
        # 1. RÉCUPÉRATION DE L'ANCIEN ÉTAT
        old_instance = None
        if self.pk:
            old_instance = Etudiant.objects.filter(pk=self.pk).first()

        # 2. VÉRIFIER SI LE MATRICULE DOIT ÊTRE GÉNÉRÉ OU MODIFIÉ
        # On ne génère que si : 
        # - Nouveau matricule (création)
        # - OU Changement de filière
        # - OU Changement d'année
        is_new = not self.pk
        has_structure_changed = old_instance and (
            old_instance.annee_academique != self.annee_academique or 
            old_instance.filiere != self.filiere
        )

        if is_new or has_structure_changed:
            if self.filiere and self.annee_academique:
                # Extraction 2025 -> 25
                annee_prefix = self.annee_academique.libelle.split('-')[0][-2:]
                code_f = self.filiere.code_filiere
                
                # RECHERCHE DU DERNIER MATRICULE POUR CE GROUPE (Plus fiable que count)
                prefixe_recherche = f"{annee_prefix}{code_f}"
                derniere_fiche = Etudiant.objects.filter(
                    matricule_id__startswith=prefixe_recherche
                ).order_by('-matricule_id').first()

                if derniere_fiche and derniere_fiche.matricule_id:
                    # On extrait le numéro (les 4 derniers chiffres) et on fait +1
                    try:
                        dernier_numero = int(derniere_fiche.matricule_id[-4:])
                        nouveau_numero = dernier_numero + 1
                    except ValueError:
                        nouveau_numero = 1
                else:
                    nouveau_numero = 1

                self.matricule_id = f"{prefixe_recherche}{nouveau_numero:04d}"

        # 3. NETTOYAGE (Gardé de ton code original)
        if self.nom: self.nom = self.nom.upper().strip()
        if self.tuteur_nom: self.tuteur_nom = self.tuteur_nom.upper().strip()

        # 4. TÉLÉPHONE
        if self.telephone and not self.telephone.startswith("+237"):
            self.telephone = "+237" + self.telephone.replace(" ", "")

        super().save(*args, **kwargs)
        

class EtudiantParAnnee(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name='parcours')
    filiere = models.ForeignKey('references.Filiere', on_delete=models.PROTECT)
    annee_academique = models.ForeignKey('references.AnneeAcademique', on_delete=models.PROTECT)
    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Scolarité Étudiant"
        # Empêche un étudiant d'être inscrit deux fois la même année
        unique_together = ('etudiant', 'annee_academique')

    def __str__(self):
        return f"{self.etudiant.nom} - {self.annee_academique.libelle}"

