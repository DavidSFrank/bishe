from rest_framework import serializers
from .models import Category, Package


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'sort_order', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class PackageSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Package
        fields = [
            'id', 'category', 'name', 'description', 'price', 'original_price', 'image',
            'items', 'suitable_for', 'notice', 'sales_count', 'views_count', 'is_hot',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sales_count', 'views_count', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category'] = CategorySerializer(instance.category).data if instance.category else None
        return data
