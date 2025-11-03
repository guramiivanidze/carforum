from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from gamification.services import GamificationService

User = get_user_model()


class Command(BaseCommand):
    help = 'Update Moderator Friend badge progress for all users based on their existing reports'

    def handle(self, *args, **options):
        self.stdout.write('Updating Moderator Friend badge progress...\n')
        
        # Get all users who have made reports
        from forum.models import Report
        reporters = User.objects.filter(reports__isnull=False).distinct()
        
        updated_count = 0
        badges_unlocked = 0
        
        for user in reporters:
            result = GamificationService.check_reports_badge(user)
            report_count = result['total_reports']
            
            self.stdout.write(f'  User: {user.username} - {report_count} reports')
            
            if result['badge_unlocked']:
                self.stdout.write(self.style.SUCCESS(f'    ✓ Unlocked Moderator Friend badge!'))
                badges_unlocked += 1
            
            updated_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCompleted! Updated {updated_count} users, {badges_unlocked} badges unlocked.'
        ))
