# Create your views here.
from rest_framework import viewsets
from .models import Filiere, AnneeAcademique
from .serializers import FiliereSerializer, AnneeAcademiqueSerializer
from audit.mixins import AuditMixin
from rest_framework.permissions import DjangoModelPermissions
class FiliereViewSet(AuditMixin,viewsets.ModelViewSet):
    queryset = Filiere.objects.all()
    serializer_class = FiliereSerializer
    permission_classes = [DjangoModelPermissions]

class AnneeAcademiqueViewSet(AuditMixin,viewsets.ModelViewSet):
    queryset = AnneeAcademique.objects.all()
    serializer_class = AnneeAcademiqueSerializer
    permission_classes = [DjangoModelPermissions]