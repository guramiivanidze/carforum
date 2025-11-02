from rest_framework import serializers
from .models import UserLevel, Badge, UserBadge, UserStreak


class UserLevelSerializer(serializers.ModelSerializer):
    """Serializer for user level and XP"""
    current_xp = serializers.ReadOnlyField()
    xp_to_next_level = serializers.ReadOnlyField()
    xp_progress_percentage = serializers.ReadOnlyField()
    total_xp = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserLevel
        fields = ['id', 'user', 'username', 'xp', 'level', 'level_name', 
                  'current_xp', 'xp_to_next_level', 'xp_progress_percentage', 
                  'total_xp', 'created_at', 'updated_at']
        read_only_fields = ['user', 'xp', 'level', 'level_name']


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
