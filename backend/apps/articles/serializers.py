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
