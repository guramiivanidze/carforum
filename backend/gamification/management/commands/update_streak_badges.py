from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from gamification.models import UserStreak
from gamification.services import GamificationService

User = get_user_model()


class Command(BaseCommand):
    help = 'Update streak badge progress for all users based on their current streak'

    def handle(self, *args, **options):
        self.stdout.write('Updating streak badge progress...\n')
        
        # Get all users with streaks
        user_streaks = UserStreak.objects.all()
        
        updated_count = 0
        badges_unlocked = 0
        
        for user_streak in user_streaks:
            user = user_streak.user
            current_streak = user_streak.current_streak
            
            self.stdout.write(f'  User: {user.username} - {current_streak} day streak')
            
            # Update all streak badges
            streak_badges = [
                ('3 Days Active', 3),
                ('7 Days Active', 7),
                ('30 Days Active', 30),
                ('100 Days Active', 100)
            ]
            
            for badge_name, requirement in streak_badges:
                badge = GamificationService.update_badge_progress(
                    user, badge_name, set_progress=current_streak
                )
                if badge:
                    self.stdout.write(self.style.SUCCESS(f'    ✓ Unlocked {badge_name} badge!'))
                    badges_unlocked += 1
            
            updated_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCompleted! Updated {updated_count} users, {badges_unlocked} badges unlocked.'
        ))
