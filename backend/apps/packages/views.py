from utils.permissions import IsAdminOrReadOnly
from utils.viewsets import StandardModelViewSet
from .models import Category, Package
from .serializers import CategorySerializer, PackageSerializer


class CategoryViewSet(StandardModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


class PackageViewSet(StandardModelViewSet):
    serializer_class = PackageSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['category', 'is_hot', 'is_active']
    search_fields = ['name', 'description', 'suitable_for']
    ordering_fields = ['sales_count', 'created_at', 'price']

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            return Package.objects.all()
        return Package.objects.filter(is_active=True)
