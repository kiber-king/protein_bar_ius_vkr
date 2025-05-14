from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
import random
from .models import Batch, BatchParameter, ProductionSettings, Notification, ComputerVisionData
from .serializers import (
    BatchSerializer, BatchListSerializer, BatchParameterSerializer,
    ProductionSettingsSerializer, NotificationSerializer, ComputerVisionDataSerializer
)

class BatchViewSet(viewsets.ModelViewSet):
    """
    API для управления партиями протеиновых батончиков
    """
    queryset = Batch.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BatchListSerializer
        return BatchSerializer
    
    @action(detail=False, methods=['post'])
    def start_production(self, request):
        """
        Запуск производства новой партии
        """
        # Завершаем все активные партии
        active_batches = Batch.objects.filter(is_active=True)
        for batch in active_batches:
            batch.is_active = False
            batch.end_time = timezone.now()
            batch.save()
            
            # Создаем уведомление о завершении партии
            Notification.objects.create(
                batch=batch,
                message=f"Партия {batch.batch_number} завершена",
                notification_type='info'
            )
        
        # Создаем новую партию
        batch_number = f"B{timezone.now().strftime('%Y%m%d%H%M%S')}"
        batch = Batch.objects.create(
            batch_number=batch_number,
            start_time=timezone.now(),
            is_active=True
        )
        
        # Создаем уведомление о запуске партии
        Notification.objects.create(
            batch=batch,
            message=f"Партия {batch.batch_number} запущена",
            notification_type='success'
        )
        
        # Генерируем начальные параметры
        settings = ProductionSettings.objects.filter(is_active=True).first()
        if settings:
            BatchParameter.objects.create(
                batch=batch,
                temperature=settings.temperature,
                pressure=settings.pressure,
                mixing_speed=settings.mixing_speed,
                glazing_thickness=settings.glazing_thickness
            )
        else:
            # Если настройки не найдены, используем значения по умолчанию
            BatchParameter.objects.create(
                batch=batch,
                temperature=170.0,
                pressure=2.5,
                mixing_speed=60.0,
                glazing_thickness=2.0
            )
        
        return Response(BatchSerializer(batch).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def stop_production(self, request, pk=None):
        """
        Остановка производства партии
        """
        batch = self.get_object()
        if not batch.is_active:
            return Response(
                {"detail": "Партия уже остановлена"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        batch.is_active = False
        batch.end_time = timezone.now()
        batch.save()
        
        # Создаем уведомление о завершении партии
        Notification.objects.create(
            batch=batch,
            message=f"Партия {batch.batch_number} остановлена",
            notification_type='info'
        )
        
        return Response(BatchSerializer(batch).data)
    
    @action(detail=True, methods=['post'])
    def simulate_parameter(self, request, pk=None):
        """
        Генерация случайных параметров для симуляции процесса
        """
        batch = self.get_object()
        if not batch.is_active:
            return Response(
                {"detail": "Нельзя симулировать параметры для неактивной партии"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем последний параметр
        last_parameter = BatchParameter.objects.filter(batch=batch).order_by('-timestamp').first()
        
        # Если параметры отсутствуют, используем значения по умолчанию
        if not last_parameter:
            settings = ProductionSettings.objects.filter(is_active=True).first()
            if settings:
                temperature = settings.temperature
                pressure = settings.pressure
                mixing_speed = settings.mixing_speed
                glazing_thickness = settings.glazing_thickness
            else:
                temperature = 170.0
                pressure = 2.5
                mixing_speed = 60.0
                glazing_thickness = 2.0
        else:
            # Генерируем новые значения на основе последних с небольшим отклонением
            temperature = last_parameter.temperature + random.uniform(-0.1, 0.2)
            pressure = last_parameter.pressure + random.uniform(-0.01, 0.02)
            mixing_speed = last_parameter.mixing_speed + random.uniform(-0.2, 0.2)
            glazing_thickness = last_parameter.glazing_thickness + random.uniform(-0.01, 0.02)
        
        # Проверяем критические значения для выявления брака
        is_defect = (
            temperature < 160.0 or temperature > 180.0 or
            pressure < 2.0 or pressure > 3.8 or
            mixing_speed < 55.0 or mixing_speed > 65.0 or
            glazing_thickness < 1.8 or glazing_thickness > 2.8
        )
        
        # Создаем новый параметр
        parameter = BatchParameter.objects.create(
            batch=batch,
            temperature=temperature,
            pressure=pressure,
            mixing_speed=mixing_speed,
            glazing_thickness=glazing_thickness,
            is_defect=is_defect
        )
        
        # Обновляем статистику партии
        batch.total_count += 1
        if is_defect:
            batch.defect_count += 1
            
            # Создаем уведомление о браке
            Notification.objects.create(
                batch=batch,
                message=f"Обнаружен брак в партии {batch.batch_number}",
                notification_type='warning'
            )
        
        batch.save()
        
        return Response(BatchParameterSerializer(parameter).data)

class BatchParameterViewSet(viewsets.ModelViewSet):
    """
    API для управления параметрами партий
    """
    queryset = BatchParameter.objects.all()
    serializer_class = BatchParameterSerializer
    
    def get_queryset(self):
        queryset = BatchParameter.objects.all()
        batch_id = self.request.query_params.get('batch_id', None)
        if batch_id is not None:
            queryset = queryset.filter(batch_id=batch_id)
        return queryset
    
    @action(detail=False, methods=['get'])
    def current_parameters(self, request):
        """
        Получение текущих параметров активной партии
        """
        active_batch = Batch.objects.filter(is_active=True).first()
        if not active_batch:
            return Response(
                {"detail": "Нет активных партий"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        parameter = BatchParameter.objects.filter(batch=active_batch).order_by('-timestamp').first()
        if not parameter:
            return Response(
                {"detail": "Нет параметров для активной партии"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(BatchParameterSerializer(parameter).data)

class ProductionSettingsViewSet(viewsets.ModelViewSet):
    """
    API для управления настройками производства
    """
    queryset = ProductionSettings.objects.all()
    serializer_class = ProductionSettingsSerializer
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Активация настройки производства
        """
        settings = self.get_object()
        
        # Деактивируем все настройки
        ProductionSettings.objects.all().update(is_active=False)
        
        # Активируем выбранную настройку
        settings.is_active = True
        settings.save()
        
        # Если есть активная партия, создаем новые параметры на основе настроек
        active_batch = Batch.objects.filter(is_active=True).first()
        if active_batch:
            # Создаем новый параметр
            BatchParameter.objects.create(
                batch=active_batch,
                temperature=settings.temperature,
                pressure=settings.pressure,
                mixing_speed=settings.mixing_speed,
                glazing_thickness=settings.glazing_thickness
            )
            
            # Создаем уведомление об изменении настроек
            Notification.objects.create(
                batch=active_batch,
                message=f"Настройки производства изменены на {settings.name}",
                notification_type='info'
            )
        
        return Response(ProductionSettingsSerializer(settings).data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Получение активной настройки производства
        """
        settings = ProductionSettings.objects.filter(is_active=True).first()
        if not settings:
            return Response(
                {"detail": "Нет активных настроек производства"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(ProductionSettingsSerializer(settings).data)

class NotificationViewSet(viewsets.ModelViewSet):
    """
    API для управления уведомлениями
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        queryset = Notification.objects.all()
        batch_id = self.request.query_params.get('batch_id', None)
        if batch_id is not None:
            queryset = queryset.filter(batch_id=batch_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        Отметка всех уведомлений как прочитанных
        """
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({"status": "success"})

class ComputerVisionViewSet(viewsets.ModelViewSet):
    """
    API для управления данными компьютерного зрения
    """
    queryset = ComputerVisionData.objects.all()
    serializer_class = ComputerVisionDataSerializer
    
    def get_queryset(self):
        queryset = ComputerVisionData.objects.all()
        batch_id = self.request.query_params.get('batch_id', None)
        if batch_id is not None:
            queryset = queryset.filter(batch_id=batch_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def start_camera(self, request):
        """
        Запуск камеры и обработки видео
        """
        active_batch = Batch.objects.filter(is_active=True).first()
        if not active_batch:
            return Response(
                {"detail": "Нет активных партий для работы камеры"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Здесь будет код для инициализации камеры
        # Это заглушка для будущей реализации
        
        return Response({"status": "success", "message": "Камера запущена"})
    
    @action(detail=False, methods=['post'])
    def stop_camera(self, request):
        """
        Остановка камеры и обработки видео
        """
        # Здесь будет код для остановки камеры
        # Это заглушка для будущей реализации
        
        return Response({"status": "success", "message": "Камера остановлена"})
    
    @action(detail=False, methods=['post'])
    def process_frame(self, request):
        """
        Обработка кадра видео через YOLO
        """
        active_batch = Batch.objects.filter(is_active=True).first()
        if not active_batch:
            return Response(
                {"detail": "Нет активных партий для обработки кадра"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Здесь будет код для обработки кадра через YOLO
        # Это заглушка для будущей реализации - просто создаем случайные данные
        vision_data = ComputerVisionData.objects.create(
            batch=active_batch,
            detected_objects={"objects": ["protein_bar"], "boxes": [[100, 100, 200, 200]]},
            confidence_score=random.uniform(0.7, 0.99),
            is_defect=random.choice([True, False])
        )
        
        return Response(ComputerVisionDataSerializer(vision_data).data) 