from rest_framework import serializers
from apps.packages.models import Package
from .models import Appointment
from apps.packages.serializers import PackageSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    package = serializers.PrimaryKeyRelatedField(queryset=Package.objects.all())
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    date = serializers.DateField(write_only=True, required=False)

    class Meta:
        model = Appointment
        fields = [
            'id', 'user', 'package', 'name', 'phone', 'id_card', 'gender',
            'appointment_date', 'date', 'time_slot', 'order_no', 'amount',
            'status', 'remark', 'reject_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_no', 'amount', 'created_at', 'updated_at']

    def validate(self, attrs):
        if not attrs.get('appointment_date') and attrs.get('date'):
            attrs['appointment_date'] = attrs.pop('date')
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['package'] = PackageSerializer(instance.package).data if instance.package else None
        return data
