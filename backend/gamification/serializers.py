from rest_framework import serializers
from .models import Level, UserLevel, Badge, UserBadge, UserStreak


class LevelSerializer(serializers.ModelSerializer):
    """Serializer for level definitions"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Level
        fields = ['id', 'level_number', 'name', 'xp_required', 'icon', 'image', 'image_url', 'color', 'is_active']
    
    def get_image_url(self, obj):
        """Get the full URL for the level image"""
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class UserLevelSerializer(serializers.ModelSerializer):
    """Serializer for user level and XP"""
    level_name = serializers.ReadOnlyField()
    current_xp = serializers.ReadOnlyField()
    xp_to_next_level = serializers.ReadOnlyField()
    xp_progress_percentage = serializers.ReadOnlyField()
    total_xp = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    
    # Add current level details
    current_level_icon = serializers.SerializerMethodField()
    current_level_image = serializers.SerializerMethodField()
    current_level_color = serializers.SerializerMethodField()
    
    # Add next level details
    next_level_number = serializers.SerializerMethodField()
    next_level_name = serializers.SerializerMethodField()
    next_level_icon = serializers.SerializerMethodField()
    next_level_image = serializers.SerializerMethodField()
    next_level_xp_required = serializers.SerializerMethodField()
    
    def get_current_level_icon(self, obj):
        level = obj.current_level_obj
        return level.icon if level else '⭐'
    
    def get_current_level_image(self, obj):
        """Get the full URL for the current level image"""
        level = obj.current_level_obj
        if level and level.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(level.image.url)
            # Fallback: build absolute URL manually
            from django.conf import settings
            return f"http://localhost:8000{level.image.url}"
        return None
    
    def get_current_level_color(self, obj):
        level = obj.current_level_obj
        return level.color if level else '#3b82f6'
    
    def get_next_level_number(self, obj):
        next_level = obj.next_level_obj
        return next_level.level_number if next_level else None
    
    def get_next_level_name(self, obj):
        next_level = obj.next_level_obj
        return next_level.name if next_level else None
    
    def get_next_level_icon(self, obj):
        next_level = obj.next_level_obj
        return next_level.icon if next_level else None
    
    def get_next_level_image(self, obj):
        """Get the full URL for the next level image"""
        next_level = obj.next_level_obj
        if next_level and next_level.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(next_level.image.url)
            # Fallback: build absolute URL manually
            from django.conf import settings
            return f"http://localhost:8000{next_level.image.url}"
        return None
    
    def get_next_level_xp_required(self, obj):
        next_level = obj.next_level_obj
        return next_level.xp_required if next_level else None
    
    class Meta:
        model = UserLevel
        fields = ['id', 'user', 'username', 'xp', 'level', 'level_name', 
                  'current_xp', 'xp_to_next_level', 'xp_progress_percentage', 
                  'total_xp', 'current_level_icon', 'current_level_image', 'current_level_color',
                  'next_level_number', 'next_level_name', 'next_level_icon', 'next_level_image',
                  'next_level_xp_required', 'created_at', 'updated_at']
        read_only_fields = ['user', 'xp', 'level']


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for badge definitions"""
    class Meta:
        model = Badge
        fields = ['id', 'name', 'icon', 'category', 'description', 'requirement', 
                  'requirement_count', 'xp_reward', 'is_active', 'order']


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for user badges with progress - flattened structure"""
    # Flatten badge fields to top level
    name = serializers.CharField(source='badge.name', read_only=True)
    icon = serializers.CharField(source='badge.icon', read_only=True)
    category = serializers.CharField(source='badge.category', read_only=True)
    description = serializers.CharField(source='badge.description', read_only=True)
    requirement = serializers.CharField(source='badge.requirement', read_only=True)
    required_count = serializers.IntegerField(source='badge.requirement_count', read_only=True)
    xp_reward = serializers.IntegerField(source='badge.xp_reward', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    earned_date = serializers.SerializerMethodField()
    
    def get_earned_date(self, obj):
        if obj.unlocked_at:
            return obj.unlocked_at.strftime('%b %d, %Y')
        return None
    
    class Meta:
        model = UserBadge
        fields = ['id', 'name', 'icon', 'category', 'description', 'requirement', 
                  'required_count', 'xp_reward', 'progress', 'unlocked', 'earned_date', 
                  'progress_percentage', 'unlocked_at']
        read_only_fields = ['user', 'unlocked', 'unlocked_at']


class UserStreakSerializer(serializers.ModelSerializer):
    """Serializer for user activity streaks"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserStreak
        fields = ['id', 'user', 'username', 'current_streak', 'longest_streak', 
                  'last_activity_date', 'created_at', 'updated_at']
        read_only_fields = ['user', 'current_streak', 'longest_streak', 'last_activity_date']


class UserGamificationSerializer(serializers.Serializer):
    """Combined serializer for user gamification data"""
    level_data = UserLevelSerializer(read_only=True)
    badges = UserBadgeSerializer(many=True, read_only=True)
    streak_data = UserStreakSerializer(read_only=True)
    leaderboard_position = serializers.IntegerField(read_only=True)
