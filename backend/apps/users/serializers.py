from rest_framework import serializers
from apps.packages.serializers import PackageSerializer
from .models import User, Admin, Favorite


def is_profile_completed(user):
    return bool(user.real_name and user.phone and user.id_card)


class UserSerializer(serializers.ModelSerializer):
    profile_completed = serializers.SerializerMethodField()

    def get_profile_completed(self, obj):
        return is_profile_completed(obj)

    class Meta:
        model = User
        fields = [
            'id', 'openid', 'nickname', 'avatar', 'phone', 'real_name',
            'id_card', 'gender', 'profile_completed', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    profile_completed = serializers.SerializerMethodField(read_only=True)

    def get_profile_completed(self, obj):
        return is_profile_completed(obj)

    def validate_phone(self, value):
        if value and (len(value) != 11 or not value.isdigit()):
            raise serializers.ValidationError('手机号格式不正确')
        return value

    def validate_id_card(self, value):
        value = (value or '').upper()
        if value and len(value) != 18:
            raise serializers.ValidationError('身份证号应为18位')
        if value and not value[:-1].isdigit():
            raise serializers.ValidationError('身份证号格式不正确')
        if value and not (value[-1].isdigit() or value[-1] == 'X'):
            raise serializers.ValidationError('身份证号格式不正确')
        return value

    class Meta:
        model = User
        fields = ['id', 'nickname', 'avatar', 'phone', 'real_name', 'id_card', 'gender', 'profile_completed']
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
        read_only_fields = ['id', 'user', 'created_at']
