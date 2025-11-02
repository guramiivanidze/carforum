from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserLevelViewSet, BadgeViewSet, UserBadgeViewSet, 
    UserStreakViewSet, user_gamification
)

router = DefaultRouter()
router.register(r'user-levels', UserLevelViewSet)
router.register(r'badges', BadgeViewSet)
router.register(r'user-badges', UserBadgeViewSet)
router.register(r'streaks', UserStreakViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user/<int:user_id>/', user_gamification, name='user-gamification'),
]
