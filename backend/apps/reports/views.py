from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.decorators import action
from utils.permissions import IsAdmin, IsUser
from utils.response import success, error
from utils.viewsets import StandardModelViewSet
from apps.appointments.models import Appointment
from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(StandardModelViewSet):
    serializer_class = ReportSerializer
    ordering_fields = ['created_at', 'report_date']

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'admin':
            return Report.objects.select_related('appointment', 'appointment__user', 'appointment__package').all()
        return Report.objects.select_related('appointment', 'appointment__user', 'appointment__package').filter(
            appointment__user_id=self.request.user.id
        )

    def get_permissions(self):
        if self.action in ['my']:
            return [IsUser()]
        if self.action in ['retrieve']:
            return [IsUser() if getattr(self.request.user, 'role', None) == 'user' else IsAdmin()]
        return [IsAdmin()]

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)
        try:
            return queryset.get(**{self.lookup_field: lookup_value})
        except Report.DoesNotExist:
            return get_object_or_404(queryset, appointment_id=lookup_value)

    def retrieve(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'user':
            return super().retrieve(request, *args, **kwargs)

        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = kwargs.get(lookup_url_kwarg)
        queryset = self.filter_queryset(self.get_queryset())

        by_report_id = queryset.filter(id=lookup_value).first()
        if by_report_id:
            return success(self.get_serializer(by_report_id).data)

        by_appointment_id = queryset.filter(appointment_id=lookup_value).first()
        if by_appointment_id:
            return success(self.get_serializer(by_appointment_id).data)

        appointment_exists = Appointment.objects.filter(id=lookup_value, user_id=request.user.id).exists()
        if appointment_exists:
            return error('报告生成中，请稍后查看', code=404, status=404)
        return error('报告不存在', code=404, status=404)

    @action(detail=False, methods=['get'], url_path='my')
    def my(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return success(serializer.data)

    @action(detail=False, methods=['get'], url_path='appointment-options')
    def appointment_options(self, request):
        keyword = (request.query_params.get('keyword') or '').strip()
        queryset = Appointment.objects.select_related('package', 'user').filter(
            report__isnull=True,
            status__in=[1, 2]
        ).order_by('-appointment_date', '-id')

        if keyword:
            queryset = queryset.filter(
                Q(order_no__icontains=keyword)
                | Q(name__icontains=keyword)
                | Q(phone__icontains=keyword)
            )

        rows = [
            {
                'id': item.id,
                'order_no': item.order_no,
                'name': item.name,
                'phone': item.phone,
                'appointment_date': item.appointment_date,
                'time_slot': item.time_slot,
                'package_name': item.package.name if item.package else ''
            }
            for item in queryset[:100]
        ]
        return success(rows)

