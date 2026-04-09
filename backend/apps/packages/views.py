from utils.permissions import IsAdminOrReadOnly
from utils.viewsets import StandardModelViewSet
from .models import Category, Package
from .serializers import CategorySerializer, PackageSerializer


class CategoryViewSet(StandardModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            return Category.objects.prefetch_related('package_set').order_by('id')
        return Category.objects.filter(is_active=True).order_by('sort_order', '-created_at')


class PackageViewSet(StandardModelViewSet):
    serializer_class = PackageSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['is_hot', 'is_active']
    search_fields = ['name', 'description', 'suitable_for']
    ordering_fields = ['id', 'sales_count', 'created_at', 'price']

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            queryset = Package.objects.all().order_by('id')
        else:
            queryset = Package.objects.filter(is_active=True)

        category_id = self.request.query_params.get('category')
        if category_id not in [None, '']:
            try:
                queryset = queryset.filter(category_id=int(category_id))
            except (TypeError, ValueError):
                return queryset.none()

        return queryset
