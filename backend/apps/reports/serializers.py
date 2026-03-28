from rest_framework import serializers
from apps.appointments.models import Appointment
from .models import Report
from apps.appointments.serializers import AppointmentSerializer


class ReportSerializer(serializers.ModelSerializer):
    appointment = serializers.PrimaryKeyRelatedField(queryset=Appointment.objects.all())

    class Meta:
        model = Report
        fields = [
            'id', 'appointment', 'result_summary', 'file_url', 'doctor',
            'report_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['appointment'] = AppointmentSerializer(instance.appointment).data if instance.appointment else None
        return data
