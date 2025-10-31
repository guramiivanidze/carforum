from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Category, Topic, Reply, UserProfile, ReportReason, Report, Bookmark
from .serializers import (
    CategorySerializer, TopicSerializer, TopicDetailSerializer,
    ReplySerializer, UserProfileSerializer, ReportReasonSerializer, ReportSerializer, BookmarkSerializer
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
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['get'])
    def increment_views(self, request, pk=None):
        """Increment topic views"""
        topic = self.get_object()
        topic.views += 1
        topic.save()
        return Response({'views': topic.views})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def replies(self, request, pk=None):
        """Create a reply for this topic"""
        topic = self.get_object()
        serializer = ReplySerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(author=request.user, topic=topic)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def bookmark(self, request, pk=None):
        """Bookmark or unbookmark a topic"""
        topic = self.get_object()
        user = request.user
        
        bookmark = Bookmark.objects.filter(user=user, topic=topic).first()
        
        if bookmark:
            # Unbookmark
            bookmark.delete()
            return Response({
                'status': 'unbookmarked',
                'user_has_bookmarked': False
            })
        else:
            # Bookmark
            Bookmark.objects.create(user=user, topic=topic)
            return Response({
                'status': 'bookmarked',
                'user_has_bookmarked': True
            }, status=status.HTTP_201_CREATED)


class ReplyViewSet(viewsets.ModelViewSet):
    """API endpoint for replies"""
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Like or unlike a reply"""
        reply = self.get_object()
        user = request.user
        
        if reply.likes.filter(id=user.id).exists():
            # Unlike
            reply.likes.remove(user)
            return Response({
                'status': 'unliked',
                'likes_count': reply.likes_count,
                'user_has_liked': False
            })
        else:
            # Like
            reply.likes.add(user)
            return Response({
                'status': 'liked',
                'likes_count': reply.likes_count,
                'user_has_liked': True
            })


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
    
    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """Get user's replies with report information"""
        from .serializers import ReplySerializer
        profile = self.get_object()
        replies = Reply.objects.filter(author=profile.user).select_related('topic', 'author').order_by('-created_at')
        
        # Add context to show resolved reports if viewing own profile
        serializer = ReplySerializer(replies, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def topics(self, request, pk=None):
        """Get user's topics"""
        profile = self.get_object()
        topics = Topic.objects.filter(author=profile.user).select_related('author', 'category').order_by('-created_at')
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def bookmarks(self, request, pk=None):
        """Get user's bookmarked topics"""
        profile = self.get_object()
        bookmarks = Bookmark.objects.filter(user=profile.user).select_related('topic', 'topic__author', 'topic__category').order_by('-created_at')
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)


class ReportReasonViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for report reasons"""
    queryset = ReportReason.objects.filter(is_active=True)
    serializer_class = ReportReasonSerializer


class ReportViewSet(viewsets.ModelViewSet):
    """API endpoint for reports"""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own reports
        if self.request.user.is_staff:
            return Report.objects.all()
        return Report.objects.filter(reporter=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Check if user already reported this reply
        reply_id = request.data.get('reply')
        if Report.objects.filter(reply_id=reply_id, reporter=request.user).exists():
            return Response(
                {'error': 'You have already reported this reply.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)
