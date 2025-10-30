from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Category, Topic, Reply, UserProfile
from .serializers import (
    CategorySerializer, TopicSerializer, TopicDetailSerializer,
    ReplySerializer, UserProfileSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """API endpoint for categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TopicViewSet(viewsets.ModelViewSet):
    """API endpoint for topics"""
    queryset = Topic.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TopicDetailSerializer
        return TopicSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['get'])
    def increment_views(self, request, pk=None):
        """Increment topic views"""
        topic = self.get_object()
        topic.views += 1
        topic.save()
        return Response({'views': topic.views})


class ReplyViewSet(viewsets.ModelViewSet):
    """API endpoint for replies"""
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for user profiles"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
    @action(detail=False, methods=['get'])
    def top_members(self, request):
        """Get top members by points"""
        top_profiles = UserProfile.objects.order_by('-points')[:10]
        serializer = self.get_serializer(top_profiles, many=True)
        return Response(serializer.data)
