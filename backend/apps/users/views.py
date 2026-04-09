from django.conf import settings
from django.core.files.storage import default_storage
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework import status
from utils.jwt_auth import generate_token
from utils.response import success, error
from utils.permissions import IsAdmin, IsUser
from utils.viewsets import StandardModelViewSet
from .models import User, Admin, Favorite
from .serializers import UserSerializer, AdminSerializer, FavoriteSerializer, UserProfileSerializer, is_profile_completed
from apps.appointments.models import Appointment
from apps.packages.models import Package


class WxLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code')
        stable_openid = request.data.get('openid')
        if not code:
            return error('缺少code参数', code=400)

        openid = stable_openid or code
        user, created = User.objects.get_or_create(openid=openid)
        if not user.is_active:
            return error('账号已被禁用', code=403, status=status.HTTP_403_FORBIDDEN)

        token = generate_token({"role": "user", "user_id": user.id})
        user_data = UserSerializer(user).data
        return success({
            "token": token,
            "userInfo": user_data,
            "is_new_user": created,
            "profile_completed": is_profile_completed(user),
        })


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return error('请输入账号密码', code=400)

        admin = Admin.objects.filter(username=username).first()
        if not admin or admin.password != password:
            return error('账号或密码错误', code=400)
        if not admin.is_active:
            return error('账号已被禁用', code=403, status=status.HTTP_403_FORBIDDEN)

        admin.last_login = timezone.now()
        admin.save(update_fields=['last_login'])
        token = generate_token({"role": "admin", "user_id": admin.id, "username": admin.username})
        return success({"token": token, "admin": AdminSerializer(admin).data})


class AdminProfileView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        admin = Admin.objects.filter(id=request.user.id).first()
        if not admin:
            return error('管理员不存在', code=404, status=status.HTTP_404_NOT_FOUND)
        return success(AdminSerializer(admin).data)

    def put(self, request):
        admin = Admin.objects.filter(id=request.user.id).first()
        if not admin:
            return error('管理员不存在', code=404, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if new_password:
            if not old_password or admin.password != old_password:
                return error('原密码错误', code=400)
            admin.password = new_password

        if name is not None:
            admin.name = name

        admin.save()
        return success(AdminSerializer(admin).data)


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.localdate()
        today_appointments = Appointment.objects.filter(appointment_date=today).count()
        pending_appointments = Appointment.objects.filter(status=0).count()
        total_users = User.objects.count()
        total_packages = Package.objects.count()
        return success({
            "todayAppointments": today_appointments,
            "pendingAppointments": pending_appointments,
            "totalUsers": total_users,
            "totalPackages": total_packages
        })


class UploadView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return error('未上传文件', code=400)
        file_path = default_storage.save(f'uploads/{file.name}', file)
        file_url = request.build_absolute_uri(settings.MEDIA_URL + file_path)
        return success({"url": file_url, "path": file_path})


class UserViewSet(StandardModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['is_active']
    search_fields = ['nickname', 'real_name', 'phone', 'openid']
    ordering_fields = ['created_at', 'updated_at', 'id']

    def get_permissions(self):
        if self.action in ['me']:
            return [IsUser()]
        return [IsAdmin()]

    @action(detail=False, methods=['get', 'put'], url_path='me')
    def me(self, request):
        user = User.objects.filter(id=request.user.id, is_active=True).first()
        if not user:
            return error('登录状态已失效，请重新登录', code=401, status=status.HTTP_401_UNAUTHORIZED)

        if request.method == 'GET':
            return success(UserProfileSerializer(user).data)

        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success(serializer.data)


class FavoriteViewSet(StandardModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsUser]
    filterset_fields = ['package']

    def get_queryset(self):
        return Favorite.objects.select_related('package').filter(user_id=self.request.user.id)

    def create(self, request, *args, **kwargs):
        package_id = request.data.get('package')
        exists = Favorite.objects.filter(user_id=request.user.id, package_id=package_id).first()
        if exists:
            serializer = self.get_serializer(exists)
            return success(serializer.data)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)
