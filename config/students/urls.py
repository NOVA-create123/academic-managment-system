from .views import  DossierEtudiantDetailView
from django.urls import path

urlpatterns = [
    path('dossier/<int:id>/', DossierEtudiantDetailView.as_view(), name='dossier-etudiant'),
]
