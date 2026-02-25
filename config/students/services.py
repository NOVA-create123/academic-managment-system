from .models import Etudiant
from django.db.models import Q



def detect_duplicate(nom, prenom, telephone):

    suspects = Etudiant.objects.filter(
        Q(telephone=telephone) |
        Q(nom__icontains=nom.upper(), prenom__icontains=prenom)
    )

    return suspects


def generate_matricule(annee, filiere):
    annee_code = annee.libelle[:2]  # ex: 2026-2027 -> 26
    filiere_code = filiere.code_filiere

    last_student = Etudiant.objects.filter(
        historiquefiliere__annee_academique=annee,
        historiquefiliere__filiere=filiere
    ).order_by('-numero_sequentiel').first()

    if last_student:
        next_seq = last_student.numero_sequentiel + 1
    else:
        next_seq = 1

    matricule = f"{annee_code}-{filiere_code}-{str(next_seq).zfill(4)}"

    return matricule, next_seq


