from django.core.management.base import BaseCommand
from gamification.models import UserLevel, Level


class Command(BaseCommand):
    help = 'Recalculate all user levels based on current XP and Level definitions'

    def handle(self, *args, **options):
        self.stdout.write('Recalculating user levels...\n')
        
        user_levels = UserLevel.objects.all()
        updated_count = 0
        level_changes = 0
        
        for user_level in user_levels:
            old_level = user_level.level
            old_level_name = user_level.level_name
            
            # Recalculate level
            user_level.check_level_up()
            user_level.save()
            
            if user_level.level != old_level:
                self.stdout.write(
                    f'  {user_level.user.username}: Level {old_level} ({old_level_name}) → '
                    f'Level {user_level.level} ({user_level.level_name}) [{user_level.xp} XP]'
                )
                level_changes += 1
            else:
                self.stdout.write(
                    f'  {user_level.user.username}: Level {user_level.level} ({user_level.level_name}) '
                    f'[{user_level.xp} XP] - No change'
                )
            
            updated_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCompleted! Updated {updated_count} users, {level_changes} level changes.'
        ))
