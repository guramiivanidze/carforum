from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, TagViewSet, TopicViewSet, ReplyViewSet, UserProfileViewSet, 
    ReportReasonViewSet, ReportViewSet, search, vote_poll
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'replies', ReplyViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'report-reasons', ReportReasonViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search/', search, name='search'),
    path('polls/<int:poll_id>/vote/', vote_poll, name='vote-poll'),
]
