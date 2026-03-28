import uuid
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from utils.permissions import IsAdmin, IsUser
from utils.response import success
from utils.viewsets import StandardModelViewSet
from apps.users.models import User
from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(StandardModelViewSet):
    serializer_class = AppointmentSerializer
    filterset_fields = ['status', 'appointment_date']
    ordering_fields = ['created_at', 'appointment_date']

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            return Appointment.objects.select_related('package', 'user').all()
        return Appointment.objects.select_related('package', 'user').filter(user_id=self.request.user.id)

    def get_permissions(self):
        if self.action in ['create', 'my']:
            return [IsUser()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        user = User.objects.filter(id=self.request.user.id).first()
        if not user:
            raise ValidationError('用户不存在')
        package = serializer.validated_data.get('package')
        order_no = datetime_order_no()
        serializer.save(
            user=user,
            order_no=order_no,
            amount=package.price if package else 0
        )

    @action(detail=False, methods=['get'], url_path='my')
    def my(self, request):
        queryset = Appointment.objects.select_related('package', 'user').filter(user_id=request.user.id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return success(serializer.data)


def datetime_order_no():
    return datetime_stamp() + uuid.uuid4().hex[:6]


def datetime_stamp():
    from django.utils import timezone
    return timezone.now().strftime('%Y%m%d%H%M%S')
