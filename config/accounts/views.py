from django.shortcuts import render

# Create your views here.
from django.contrib.auth.models import User
from rest_framework.viewsets import ModelViewSet
from .serializers import UserSerializer
from .permissions import IsAdminGroup
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['groups'] = list(user.groups.values_list("name", flat=True))

        return token


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

class UserViewSet(ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [IsAdminGroup]
