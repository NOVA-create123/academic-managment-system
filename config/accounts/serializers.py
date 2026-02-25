from django.contrib.auth.models import User, Group
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    group = serializers.CharField(write_only=True)
    groups = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_active",
            "password",
            "group",
            "groups",
        ]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def get_groups(self, obj):
        return list(obj.groups.values_list("name", flat=True))

    def create(self, validated_data):
        group_name = validated_data.pop("group")
        password = validated_data.pop("password")

        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        group = Group.objects.get(name=group_name)
        user.groups.add(group)

        return user
