from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import UserLevel, Badge, UserBadge, UserStreak
from .serializers import (
    UserLevelSerializer, BadgeSerializer, UserBadgeSerializer, 
    UserStreakSerializer, UserGamificationSerializer
)


class UserLevelViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for user levels"""
    queryset = UserLevel.objects.all()
    serializer_class = UserLevelSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_level(self, request):
        """Get current user's level"""
        user_level, created = UserLevel.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(user_level)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get top users by XP"""
        top_users = UserLevel.objects.select_related('user').order_by('-xp')[:100]
        serializer = self.get_serializer(top_users, many=True)
        return Response(serializer.data)


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for badges"""
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get badges grouped by category"""
        categories = {}
        for badge in Badge.objects.filter(is_active=True):
            if badge.category not in categories:
                categories[badge.category] = []
            categories[badge.category].append(BadgeSerializer(badge).data)
        return Response(categories)


class UserBadgeViewSet(viewsets.ModelViewSet):
    """API endpoint for user badges"""
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter badges by user"""
        user_id = self.request.query_params.get('user')
        if user_id:
            return UserBadge.objects.filter(user_id=user_id).select_related('badge', 'user')
        return UserBadge.objects.filter(user=self.request.user).select_related('badge')
    
    @action(detail=False, methods=['get'])
    def my_badges(self, request):
        """Get current user's badges"""
        # Get all active badges
        all_badges = Badge.objects.filter(is_active=True)
        user_badges = []
        
        for badge in all_badges:
            user_badge, created = UserBadge.objects.get_or_create(
                user=request.user,
                badge=badge
            )
            user_badges.append(user_badge)
        
        serializer = self.get_serializer(user_badges, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def user_badges(self, request):
        """Get badges for a specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all active badges
        all_badges = Badge.objects.filter(is_active=True)
        user_badges = []
        
        for badge in all_badges:
            user_badge, created = UserBadge.objects.get_or_create(
                user=user,
                badge=badge
            )
            user_badges.append(user_badge)
        
        serializer = self.get_serializer(user_badges, many=True)
        return Response(serializer.data)


class UserStreakViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for user streaks"""
    queryset = UserStreak.objects.all()
    serializer_class = UserStreakSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_streak(self, request):
        """Get current user's streak"""
        user_streak, created = UserStreak.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(user_streak)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_streak(self, request):
        """Update user's streak (called on activity)"""
        user_streak, created = UserStreak.objects.get_or_create(user=request.user)
        user_streak.update_streak()
        user_streak.save()
        serializer = self.get_serializer(user_streak)
        return Response(serializer.data)


@api_view(['GET'])
def user_gamification(request, user_id):
    """Get complete gamification data for a user"""
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get or create user level
    user_level, created = UserLevel.objects.get_or_create(user=user)
    
    # Get all badges for user
    all_badges = Badge.objects.filter(is_active=True)
    user_badges = []
    for badge in all_badges:
        user_badge, created = UserBadge.objects.get_or_create(
            user=user,
            badge=badge
        )
        user_badges.append(user_badge)
    
    # Get or create streak
    user_streak, created = UserStreak.objects.get_or_create(user=user)
    
    # Calculate leaderboard position
    higher_ranked = UserLevel.objects.filter(xp__gt=user_level.xp).count()
    leaderboard_position = higher_ranked + 1
    
    # Serialize data
    data = {
        'level_data': UserLevelSerializer(user_level).data,
        'badges': UserBadgeSerializer(user_badges, many=True).data,
        'streak_data': UserStreakSerializer(user_streak).data,
        'leaderboard_position': leaderboard_position,
    }
    
    return Response(data)

