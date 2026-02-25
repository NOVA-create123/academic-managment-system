from django.db.models.signals import pre_save
from django.dispatch import receiver
from students.models import Etudiant
from .models import HistoriqueChangements


@receiver(pre_save, sender=Etudiant)
def log_changes(sender, instance, **kwargs):
    if not instance.pk:
        return

    old = Etudiant.objects.get(pk=instance.pk)

    fields = ['nom', 'telephone', 'tuteur_nom']

    for field in fields:
        old_value = getattr(old, field)
        new_value = getattr(instance, field)

        if old_value != new_value:
            HistoriqueChangements.objects.create(
                etudiant=instance,
                champ_modifie=field,
                ancienne_valeur=old_value,
                nouvelle_valeur=new_value
            )
