from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, BannerViewSet, ConsultationViewSet

router = DefaultRouter()
router.register(r'banners', BannerViewSet, basename='banner')
router.register(r'consultations', ConsultationViewSet, basename='consultation')
router.register(r'', ArticleViewSet, basename='article')

urlpatterns = [
    path('', include(router.urls)),
]
