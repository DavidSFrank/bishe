from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Article, Banner, Consultation


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'cover_image', 'views_count',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'views_count', 'created_at', 'updated_at']


class BannerSerializer(serializers.ModelSerializer):
    def validate_image(self, value):
        if not value:
            raise serializers.ValidationError('图片地址不能为空')
        if not (value.startswith('http://') or value.startswith('https://')):
            raise serializers.ValidationError('图片地址需为http/https链接')
        return value

    def validate_link(self, value):
        if not value:
            return value
        if value.startswith('/'):
            return value
        if value.startswith('http://') or value.startswith('https://'):
            return value
        raise serializers.ValidationError('跳转链接格式不正确')

    def validate_sort_order(self, value):
        if not isinstance(value, int):
            raise serializers.ValidationError('排序需为整数')
        return value

    class Meta:
        model = Banner
        fields = ['id', 'title', 'image', 'link', 'sort_order', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConsultationSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Consultation
        fields = ['id', 'user', 'user_info', 'content', 'reply', 'status', 'created_at', 'replied_at']
        read_only_fields = ['id', 'user', 'created_at', 'replied_at']
