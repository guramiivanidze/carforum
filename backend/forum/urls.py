from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TopicViewSet, ReplyViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'replies', ReplyViewSet)
router.register(r'profiles', UserProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
