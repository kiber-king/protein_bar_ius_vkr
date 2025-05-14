from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BatchViewSet, BatchParameterViewSet,
    ProductionSettingsViewSet, NotificationViewSet,
    ComputerVisionViewSet
)

router = DefaultRouter()
router.register(r'batches', BatchViewSet)
router.register(r'parameters', BatchParameterViewSet)
router.register(r'settings', ProductionSettingsViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'computer-vision', ComputerVisionViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 