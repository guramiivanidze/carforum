from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Topic, Reply, UserProfile, ReportReason, Report, Bookmark


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.CharField(source='profile.avatar', read_only=True)
    points = serializers.IntegerField(source='profile.points', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'points', 'date_joined']


class CategorySerializer(serializers.ModelSerializer):
    topics_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = ['id', 'icon', 'title', 'description', 'topics_count', 'created_at']


class ReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    user_has_liked = serializers.SerializerMethodField()
    resolved_report = serializers.SerializerMethodField()
    
    class Meta:
        model = Reply
        fields = ['id', 'topic', 'author', 'content', 'likes_count', 'user_has_liked', 'is_hidden', 'resolved_report', 'created_at', 'updated_at']
        read_only_fields = ['author', 'topic', 'likes_count', 'is_hidden']
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def get_resolved_report(self, obj):
        # Only return resolved report info if the current user is the author
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.author == request.user:
            from .models import Report
            resolved_report = Report.objects.filter(
                reply=obj, 
                status='resolved'
            ).select_related('reason').first()
            
            if resolved_report:
                return {
                    'reason': resolved_report.reason.title if resolved_report.reason else None,
                    'reason_description': resolved_report.reason.description if resolved_report.reason else None,
                    'additional_info': resolved_report.additional_info,
                    'resolved_at': resolved_report.reviewed_at
                }
        return None


class TopicSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.title', read_only=True)
    replies_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Topic
        fields = ['id', 'title', 'author', 'category', 'category_name', 
                  'content', 'replies_count', 'views', 'created_at', 'updated_at']
        read_only_fields = ['author', 'views']


class TopicDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    replies_count = serializers.ReadOnlyField()
    user_has_bookmarked = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'title', 'author', 'category', 'content', 
                  'replies', 'replies_count', 'views', 'created_at', 'updated_at', 'user_has_bookmarked']
    
    def get_user_has_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, topic=obj).exists()
        return False
    
    def get_replies(self, obj):
        # Filter out hidden replies, but show them to their authors
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            # Show non-hidden replies + user's own hidden replies (so they can see the report)
            from django.db.models import Q
            replies = obj.replies.filter(
                Q(is_hidden=False) | Q(author=request.user, is_hidden=True)
            )
        else:
            # Anonymous users only see non-hidden replies
            replies = obj.replies.filter(is_hidden=False)
        
        return ReplySerializer(replies, many=True, context=self.context).data


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'avatar', 'points', 'bio', 'user']


class ReportReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportReason
        fields = ['id', 'title', 'description']


class ReportSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    reason_details = ReportReasonSerializer(source='reason', read_only=True)
    
    class Meta:
        model = Report
        fields = ['id', 'reply', 'reporter', 'reason', 'reason_details', 'additional_info', 'status', 'created_at']
        read_only_fields = ['reporter', 'status']


class BookmarkSerializer(serializers.ModelSerializer):
    topic_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Bookmark
        fields = ['id', 'topic', 'topic_details', 'created_at']
        read_only_fields = ['created_at']
    
    def get_topic_details(self, obj):
        return {
            'id': obj.topic.id,
            'title': obj.topic.title,
            'views': obj.topic.views,
            'replies_count': obj.topic.replies_count,
            'created_at': obj.topic.created_at,
            'author': UserSerializer(obj.topic.author).data,
            'category': CategorySerializer(obj.topic.category).data
        }
