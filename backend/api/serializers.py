from rest_framework import serializers
from .models import Batch, BatchParameter, ProductionSettings, Notification

class BatchParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchParameter
        fields = ['id', 'temperature', 'pressure', 'mixing_speed', 'glazing_thickness', 'timestamp', 'is_defect']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'batch', 'message', 'notification_type', 'timestamp', 'is_read']

class BatchSerializer(serializers.ModelSerializer):
    parameters = BatchParameterSerializer(many=True, read_only=True)
    notifications = NotificationSerializer(many=True, read_only=True)
    defect_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Batch
        fields = ['id', 'batch_number', 'start_time', 'end_time', 'is_active', 
                  'defect_count', 'total_count', 'defect_percentage', 'parameters', 'notifications']

class BatchListSerializer(serializers.ModelSerializer):
    defect_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Batch
        fields = ['id', 'batch_number', 'start_time', 'end_time', 'is_active', 
                  'defect_count', 'total_count', 'defect_percentage']

class ProductionSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionSettings
        fields = ['id', 'name', 'temperature', 'pressure', 'mixing_speed', 
                  'glazing_thickness', 'is_active', 'timestamp'] 