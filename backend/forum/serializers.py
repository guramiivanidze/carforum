from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Topic, Reply, UserProfile, ReportReason, Report, Bookmark,
    TopicImage, Poll, PollOption, PollVote
)


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
    child_replies = serializers.SerializerMethodField()
    replies_count = serializers.ReadOnlyField()
    parent_author = serializers.SerializerMethodField()
    
    class Meta:
        model = Reply
        fields = ['id', 'topic', 'author', 'parent', 'parent_author', 'content', 'likes_count', 'user_has_liked', 
                  'child_replies', 'replies_count', 'is_hidden', 'resolved_report', 'created_at', 'updated_at']
        read_only_fields = ['author', 'topic', 'likes_count', 'is_hidden']
    
    def get_parent_author(self, obj):
        """Get the author info of the parent reply"""
        if obj.parent:
            # Safely get avatar from profile, fallback to default if no profile exists
            try:
                avatar = obj.parent.author.profile.avatar
            except UserProfile.DoesNotExist:
                avatar = '👤'  # Default avatar
            
            return {
                'id': obj.parent.author.id,
                'username': obj.parent.author.username,
                'avatar': avatar
            }
        return None
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def get_child_replies(self, obj):
        """Recursively serialize nested replies"""
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            # Show non-hidden replies + user's own hidden replies
            from django.db.models import Q
            child_replies = obj.child_replies.filter(
                Q(is_hidden=False) | Q(author=request.user, is_hidden=True)
            )
        else:
            child_replies = obj.child_replies.filter(is_hidden=False)
        
        return ReplySerializer(child_replies, many=True, context=self.context).data
    
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


class TopicImageSerializer(serializers.ModelSerializer):
    """Serializer for topic images"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TopicImage
        fields = ['id', 'image', 'image_url', 'caption', 'order', 'created_at']
        read_only_fields = ['created_at']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PollOptionSerializer(serializers.ModelSerializer):
    """Serializer for poll options"""
    votes_count = serializers.ReadOnlyField()
    percentage = serializers.ReadOnlyField()
    user_has_voted = serializers.SerializerMethodField()
    
    class Meta:
        model = PollOption
        fields = ['id', 'text', 'order', 'votes_count', 'percentage', 'user_has_voted']
    
    def get_user_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PollVote.objects.filter(poll_option=obj, user=request.user).exists()
        return False


class PollSerializer(serializers.ModelSerializer):
    """Serializer for polls"""
    options = serializers.SerializerMethodField()
    total_votes = serializers.ReadOnlyField()
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = Poll
        fields = ['id', 'question', 'options', 'total_votes', 'user_vote', 'created_at']
        read_only_fields = ['created_at']
    
    def get_options(self, obj):
        """Serialize poll options with proper context"""
        options = obj.options.all().order_by('order')
        return PollOptionSerializer(options, many=True, context=self.context).data
    
    def get_user_vote(self, obj):
        """Get which option the user voted for"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = PollVote.objects.filter(
                poll_option__poll=obj,
                user=request.user
            ).select_related('poll_option').first()
            if vote:
                return vote.poll_option.id
        return None


class TopicSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.title', read_only=True)
    replies_count = serializers.ReadOnlyField()
    images = TopicImageSerializer(many=True, read_only=True)
    poll = PollSerializer(read_only=True)
    
    class Meta:
        model = Topic
        fields = ['id', 'title', 'author', 'category', 'category_name', 
                  'content', 'tags', 'replies_count', 'views', 'images', 'poll', 'created_at', 'updated_at']
        read_only_fields = ['author', 'views']


class TopicDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    replies_count = serializers.ReadOnlyField()
    user_has_bookmarked = serializers.SerializerMethodField()
    images = TopicImageSerializer(many=True, read_only=True)
    poll = PollSerializer(read_only=True)
    
    class Meta:
        model = Topic
        fields = ['id', 'title', 'author', 'category', 'content', 'tags',
                  'replies', 'replies_count', 'views', 'images', 'poll', 'created_at', 'updated_at', 'user_has_bookmarked']
    
    def get_user_has_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, topic=obj).exists()
        return False
    
    def get_replies(self, obj):
        # Only get top-level replies (parent=None), nested replies will be included via child_replies
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            # Show non-hidden replies + user's own hidden replies (so they can see the report)
            from django.db.models import Q
            replies = obj.replies.filter(
                Q(is_hidden=False) | Q(author=request.user, is_hidden=True)
            ).filter(parent=None)  # Only top-level replies
        else:
            # Anonymous users only see non-hidden top-level replies
            replies = obj.replies.filter(is_hidden=False, parent=None)
        
        return ReplySerializer(replies, many=True, context=self.context).data


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)  # Use user ID as primary ID
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'avatar', 'points', 'bio', 'date_joined']


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


class PollVoteSerializer(serializers.ModelSerializer):
    """Serializer for voting on polls"""
    class Meta:
        model = PollVote
        fields = ['id', 'poll_option', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']
