from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WxLoginView, AdminLoginView, AdminDashboardView, UploadView, UserViewSet, FavoriteViewSet, AdminProfileView

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('login/', WxLoginView.as_view()),
    path('admin/login/', AdminLoginView.as_view()),
    path('admin/profile/', AdminProfileView.as_view()),
    path('admin/dashboard/', AdminDashboardView.as_view()),
    path('upload/', UploadView.as_view()),
    path('', include(router.urls)),
]
