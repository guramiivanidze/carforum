from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TopicViewSet, ReplyViewSet, UserProfileViewSet, ReportReasonViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'replies', ReplyViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'report-reasons', ReportReasonViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
