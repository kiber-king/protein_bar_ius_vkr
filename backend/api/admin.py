from django.contrib import admin
from .models import Batch, BatchParameter, ProductionSettings, Notification

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('batch_number', 'start_time', 'end_time', 'is_active', 'defect_count', 'total_count', 'defect_percentage')
    list_filter = ('is_active',)
    search_fields = ('batch_number',)
    readonly_fields = ('defect_percentage',)

@admin.register(BatchParameter)
class BatchParameterAdmin(admin.ModelAdmin):
    list_display = ('batch', 'temperature', 'pressure', 'mixing_speed', 'glazing_thickness', 'timestamp', 'is_defect')
    list_filter = ('is_defect', 'batch')
    search_fields = ('batch__batch_number',)

@admin.register(ProductionSettings)
class ProductionSettingsAdmin(admin.ModelAdmin):
    list_display = ('name', 'temperature', 'pressure', 'mixing_speed', 'glazing_thickness', 'is_active', 'timestamp')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('message', 'notification_type', 'batch', 'timestamp', 'is_read')
    list_filter = ('notification_type', 'is_read', 'batch')
    search_fields = ('message', 'batch__batch_number') 