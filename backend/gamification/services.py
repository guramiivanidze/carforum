"""
Gamification service to track user actions and award XP/badges
"""
from django.contrib.auth.models import User
from .models import UserLevel, Badge, UserBadge, UserStreak


class GamificationService:
    """Service to handle gamification logic"""
    
    # XP rewards for actions
    XP_REWARDS = {
        'create_topic': 10,
        'create_reply': 5,
        'receive_like': 2,
        'create_bookmark': 1,
        'daily_login': 5,
    }
    
    @staticmethod
    def ensure_user_badges(user):
        """Ensure all active badges have UserBadge entries for the user"""
        all_badges = Badge.objects.filter(is_active=True)
        for badge in all_badges:
            UserBadge.objects.get_or_create(user=user, badge=badge)
    
    @staticmethod
    def award_xp(user, action_type, amount=None):
        """Award XP to user for an action"""
        if amount is None:
            amount = GamificationService.XP_REWARDS.get(action_type, 0)
        
        if amount > 0:
            user_level, created = UserLevel.objects.get_or_create(user=user)
            user_level.add_xp(amount)
            return amount
        return 0
    
    @staticmethod
    def update_badge_progress(user, badge_name, increment=1):
        """Update progress for a specific badge and return badge data if unlocked"""
        try:
            badge = Badge.objects.get(name=badge_name, is_active=True)
            user_badge, created = UserBadge.objects.get_or_create(
                user=user,
                badge=badge
            )
            was_unlocked = user_badge.unlocked
            user_badge.update_progress(increment)
            
            # Return badge data if newly unlocked
            if user_badge.unlocked and not was_unlocked:
                from .serializers import BadgeSerializer
                return {
                    'id': badge.id,
                    'name': badge.name,
                    'description': badge.description,
                    'icon': badge.icon,
                    'xp_reward': badge.xp_reward
                }
            return None
        except Badge.DoesNotExist:
            return None
    
    @staticmethod
    def track_topic_created(user):
        """Track when user creates a topic"""
        # Ensure all badges exist for this user
        GamificationService.ensure_user_badges(user)
        
        # Award XP
        xp_awarded = GamificationService.award_xp(user, 'create_topic')
        
        # Update contribution badges
        badges_unlocked = []
        
        badge = GamificationService.update_badge_progress(user, 'First Post')
        if badge:
            badges_unlocked.append(badge)
            
        badge = GamificationService.update_badge_progress(user, '10 Posts')
        if badge:
            badges_unlocked.append(badge)
            
        badge = GamificationService.update_badge_progress(user, '50 Posts')
        if badge:
            badges_unlocked.append(badge)
            
        badge = GamificationService.update_badge_progress(user, 'Expert Mechanic')
        if badge:
            badges_unlocked.append(badge)
        
        return {
            'xp_awarded': xp_awarded,
            'badges_unlocked': badges_unlocked
        }
    
    @staticmethod
    def track_reply_created(user):
        """Track when user creates a reply"""
        # Ensure all badges exist for this user
        GamificationService.ensure_user_badges(user)
        
        # Award XP
        xp_awarded = GamificationService.award_xp(user, 'create_reply')
        
        # Update contribution badges
        badges_unlocked = []
        
        badge = GamificationService.update_badge_progress(user, '100 Replies')
        if badge:
            badges_unlocked.append(badge)
            
        badge = GamificationService.update_badge_progress(user, 'Expert Mechanic')
        if badge:
            badges_unlocked.append(badge)
        
        return {
            'xp_awarded': xp_awarded,
            'badges_unlocked': badges_unlocked
        }
    
    @staticmethod
    def track_like_received(user):
        """Track when user's post receives a like"""
        # Ensure all badges exist for this user
        GamificationService.ensure_user_badges(user)
        
        # Award XP
        xp_awarded = GamificationService.award_xp(user, 'receive_like')
        
        # Update social badges
        badges_unlocked = []
        
        badge = GamificationService.update_badge_progress(user, '10 Likes')
        if badge:
            badges_unlocked.append(badge)
            
        badge = GamificationService.update_badge_progress(user, '50 Likes')
        if badge:
            badges_unlocked.append(badge)
            
        badge = GamificationService.update_badge_progress(user, '100 Likes')
        if badge:
            badges_unlocked.append(badge)
        
        return {
            'xp_awarded': xp_awarded,
            'badges_unlocked': badges_unlocked
        }
    
    @staticmethod
    def track_bookmark_created(user):
        """Track when user creates a bookmark"""
        # Ensure all badges exist for this user
        GamificationService.ensure_user_badges(user)
        
        # Award XP
        xp_awarded = GamificationService.award_xp(user, 'create_bookmark')
        
        # Update helpful badges
        badges_unlocked = []
        
        badge = GamificationService.update_badge_progress(user, 'Bookworm')
        if badge:
            badges_unlocked.append(badge)
        
        return {
            'xp_awarded': xp_awarded,
            'badges_unlocked': badges_unlocked
        }
    
    @staticmethod
    def update_daily_streak(user):
        """Update user's daily activity streak"""
        # Ensure all badges exist for this user
        GamificationService.ensure_user_badges(user)
        
        user_streak, created = UserStreak.objects.get_or_create(user=user)
        user_streak.update_streak()
        
        # Award daily login XP
        xp_awarded = GamificationService.award_xp(user, 'daily_login')
        
        # Update streak badges
        badges_unlocked = []
        
        if user_streak.current_streak >= 3:
            badge = GamificationService.update_badge_progress(user, '3 Days Active', 0)
            if badge:
                badges_unlocked.append(badge)
                
        if user_streak.current_streak >= 7:
            badge = GamificationService.update_badge_progress(user, '7 Days Active', 0)
            if badge:
                badges_unlocked.append(badge)
                
        if user_streak.current_streak >= 30:
            badge = GamificationService.update_badge_progress(user, '30 Days Active', 0)
            if badge:
                badges_unlocked.append(badge)
                
        if user_streak.current_streak >= 100:
            badge = GamificationService.update_badge_progress(user, '100 Days Active', 0)
            if badge:
                badges_unlocked.append(badge)
        
        return {
            'xp_awarded': xp_awarded,
            'current_streak': user_streak.current_streak,
            'badges_unlocked': badges_unlocked
        }
