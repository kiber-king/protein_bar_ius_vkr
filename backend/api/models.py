from django.db import models
from django.utils import timezone

class Batch(models.Model):
    """Модель партии протеиновых батончиков"""
    batch_number = models.CharField(max_length=50, unique=True, verbose_name='Номер партии')
    start_time = models.DateTimeField(default=timezone.now, verbose_name='Время начала')
    end_time = models.DateTimeField(null=True, blank=True, verbose_name='Время окончания')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    defect_count = models.IntegerField(default=0, verbose_name='Количество брака')
    total_count = models.IntegerField(default=0, verbose_name='Общее количество')
    
    @property
    def defect_percentage(self):
        """Возвращает процент брака"""
        if self.total_count == 0:
            return 0
        return round((self.defect_count / self.total_count) * 100, 2)
    
    def __str__(self):
        return f"Партия {self.batch_number}"
    
    class Meta:
        verbose_name = 'Партия'
        verbose_name_plural = 'Партии'
        ordering = ['-start_time']

class BatchParameter(models.Model):
    """Модель параметров партии протеиновых батончиков"""
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='parameters', verbose_name='Партия')
    temperature = models.FloatField(verbose_name='Температура')
    pressure = models.FloatField(verbose_name='Давление')
    mixing_speed = models.FloatField(verbose_name='Скорость перемешивания')
    glazing_thickness = models.FloatField(verbose_name='Толщина глазури')
    timestamp = models.DateTimeField(default=timezone.now, verbose_name='Время измерения')
    is_defect = models.BooleanField(default=False, verbose_name='Является браком')
    
    def __str__(self):
        return f"Параметры партии {self.batch.batch_number} - {self.timestamp}"
    
    class Meta:
        verbose_name = 'Параметр партии'
        verbose_name_plural = 'Параметры партии'
        ordering = ['-timestamp']

class ProductionSettings(models.Model):
    """Модель настроек производства"""
    name = models.CharField(max_length=50, unique=True, verbose_name='Название настройки')
    temperature = models.FloatField(verbose_name='Температура')
    pressure = models.FloatField(verbose_name='Давление')
    mixing_speed = models.FloatField(verbose_name='Скорость перемешивания')
    glazing_thickness = models.FloatField(verbose_name='Толщина глазури')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    timestamp = models.DateTimeField(auto_now=True, verbose_name='Время обновления')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Настройка производства'
        verbose_name_plural = 'Настройки производства'
        ordering = ['-timestamp']

class Notification(models.Model):
    """Модель уведомлений"""
    NOTIFICATION_TYPES = (
        ('info', 'Информация'),
        ('warning', 'Предупреждение'),
        ('error', 'Ошибка'),
        ('success', 'Успех'),
    )
    
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications', verbose_name='Партия')
    message = models.TextField(verbose_name='Сообщение')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info', verbose_name='Тип уведомления')
    timestamp = models.DateTimeField(default=timezone.now, verbose_name='Время уведомления')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')
    
    def __str__(self):
        return f"{self.get_notification_type_display()}: {self.message[:50]}"
    
    class Meta:
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
        ordering = ['-timestamp'] 