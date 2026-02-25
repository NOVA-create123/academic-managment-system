from .models import Historique

class AuditMixin:

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_action("CREATE", instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_action("UPDATE", instance)

    def perform_destroy(self, instance):
        self.log_action("DELETE", instance)
        instance.delete()

    def log_action(self, action, instance):
        user = self.request.user

        Historique.objects.create(
            utilisateur=user,
            role_au_moment=user.groups.first().name if user.groups.exists() else "Aucun",
            action=action,
            modele=instance.__class__.__name__,
            objet_id=instance.id
        )
