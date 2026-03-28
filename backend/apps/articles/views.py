from django.utils import timezone
from utils.permissions import IsAdminOrReadOnly, IsAdmin, IsUser
from utils.viewsets import StandardModelViewSet
from .models import Article, Banner, Consultation
from .serializers import ArticleSerializer, BannerSerializer, ConsultationSerializer


class ArticleViewSet(StandardModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'views_count']

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            return Article.objects.all()
        return Article.objects.filter(is_active=True)


class BannerViewSet(StandardModelViewSet):
    serializer_class = BannerSerializer
    permission_classes = [IsAdminOrReadOnly]
    ordering_fields = ['sort_order', 'created_at']

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            return Banner.objects.all()
        return Banner.objects.filter(is_active=True)


class ConsultationViewSet(StandardModelViewSet):
    serializer_class = ConsultationSerializer
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            return Consultation.objects.select_related('user').all()
        return Consultation.objects.select_related('user').filter(user_id=self.request.user.id)

    def get_permissions(self):
        role = getattr(self.request.user, 'role', None)
        if role == 'admin':
            return [IsAdmin()]
        if self.action in ['list', 'retrieve', 'create']:
            return [IsUser()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.reply:
            instance.status = 1
            instance.replied_at = timezone.now()
            instance.save(update_fields=['status', 'replied_at'])
