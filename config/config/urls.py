"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from students.views import EtudiantViewSet
from references.views import FiliereViewSet, AnneeAcademiqueViewSet
from audit.views import HistoriqueViewSet, ProposerModification, ValiderModification, ModificationsEnAttente, RejeterModification, MesPropositions, SupprimerModification
from core.views import DataQualityDashboard, export_etudiants_csv, StatsParFiliere, EtudiantsParAnnee, export_historique_csv
from accounts.views import CustomTokenView



router = DefaultRouter()
router.register(r'etudiants', EtudiantViewSet)
router.register(r'filieres', FiliereViewSet)
router.register(r'annees', AnneeAcademiqueViewSet)
router.register(r'historique', HistoriqueViewSet, basename='historique')
#router.register(r'proposer', ProposerModification)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    path('api/token/', CustomTokenView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard-qualite/', DataQualityDashboard.as_view()),
    path('api/export/etudiants/csv/', export_etudiants_csv),
    path('api/export/historique/csv/', export_historique_csv),
    path('api/stats/filieres/', StatsParFiliere.as_view()),
    path('api/stats/etudiants-par-annee/', EtudiantsParAnnee.as_view()),
    path('api/', include('students.urls')),
    path('api/', include('accounts.urls')),
    path('api/modifications/<int:id>/', SupprimerModification.as_view(), name='supprimer-modification'),
    path('api/modifications/mes-propositions/', MesPropositions.as_view()),
    path('api/modifications/rejeter/<int:id>/', RejeterModification.as_view()),
    path('api/modifications/proposer/', ProposerModification.as_view()),
    path('api/modifications/valider/<int:id>/', ValiderModification.as_view()),
    path('api/modifications/en-attente/', ModificationsEnAttente.as_view()),
]

