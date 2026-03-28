from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PackageViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'', PackageViewSet, basename='package')

urlpatterns = [
    path('', include(router.urls)),
]
