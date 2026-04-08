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
        if self.action in ['create', 'my', 'cancel']:
            return [IsUser()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        user = User.objects.filter(id=self.request.user.id).first()
        if not user:
            raise ValidationError('用户不存在')

        profile_name = (user.real_name or '').strip()
        profile_phone = (user.phone or '').strip()
        profile_id_card = (user.id_card or '').strip()
        incoming_name = (serializer.validated_data.get('name') or '').strip()
        incoming_phone = (serializer.validated_data.get('phone') or '').strip()
        incoming_id_card = (serializer.validated_data.get('id_card') or '').strip()

        name = incoming_name or profile_name
        phone = incoming_phone or profile_phone
        id_card = incoming_id_card or profile_id_card
        gender = serializer.validated_data.get('gender') or user.gender or 1

        if not name or not phone or not id_card:
            raise ValidationError('请先完善个人资料后再预约')

        package = serializer.validated_data.get('package')
        order_no = datetime_order_no()
        serializer.save(
            user=user,
            name=name,
            phone=phone,
            id_card=id_card,
            gender=gender,
            order_no=order_no,
            amount=package.price if package else 0
        )

    @action(detail=False, methods=['get'], url_path='my')
    def my(self, request):
        queryset = Appointment.objects.select_related('package', 'user').filter(user_id=request.user.id)
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return success(serializer.data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        appointment = Appointment.objects.filter(id=pk, user_id=request.user.id).first()
        if not appointment:
            raise ValidationError('预约记录不存在')
        if appointment.status != 0:
            raise ValidationError('当前状态不可取消')

        appointment.status = 3
        appointment.save(update_fields=['status', 'updated_at'])
        return success(self.get_serializer(appointment).data)


def datetime_order_no():
    return datetime_stamp() + uuid.uuid4().hex[:6]


def datetime_stamp():
    from django.utils import timezone
    return timezone.now().strftime('%Y%m%d%H%M%S')
