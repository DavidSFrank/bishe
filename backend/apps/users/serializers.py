from rest_framework import serializers
from apps.packages.serializers import PackageSerializer
from .models import User, Admin, Favorite


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'openid', 'nickname', 'avatar', 'phone', 'real_name',
            'id_card', 'gender', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nickname', 'avatar', 'phone', 'real_name', 'id_card', 'gender']
        read_only_fields = ['id']


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['id', 'username', 'name', 'is_active', 'last_login', 'created_at']
        read_only_fields = ['id', 'last_login', 'created_at']


class FavoriteSerializer(serializers.ModelSerializer):
    package_info = PackageSerializer(source='package', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'package', 'package_info', 'created_at']
        read_only_fields = ['id', 'created_at']
