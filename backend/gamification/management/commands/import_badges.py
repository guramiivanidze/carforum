from django.core.management.base import BaseCommand
from gamification.models import Badge
from datetime import datetime
import sys
import os

# Add the backend directory to the path to import badges.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

class Command(BaseCommand):
    help = 'Import badges from badges.py into the database'

    def handle(self, *args, **options):
        try:
            from badges import badges
        except ImportError:
            self.stdout.write(self.style.ERROR('Could not import badges from badges.py'))
            return

        created_count = 0
        updated_count = 0
        
        self.stdout.write(self.style.SUCCESS(f'Found {len(badges)} badges to import'))
        
        for badge_data in badges:
            try:
                # Remove fields that are not in the model or need special handling
                badge_dict = {
                    'name': badge_data['name'],
                    'icon': badge_data['icon'],
                    'category': badge_data['category'],
                    'description': badge_data['description'],
                    'requirement': badge_data['requirement'],
                    'requirement_count': badge_data['requirement_count'],
                    'xp_reward': badge_data['xp_reward'],
                    'is_active': bool(badge_data['is_active']),
                    'order': badge_data['order'],
                }
                
                # Update or create badge
                badge, created = Badge.objects.update_or_create(
                    name=badge_dict['name'],
                    defaults=badge_dict
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Created: {badge.icon} {badge.name}'))
                else:
                    updated_count += 1
                    self.stdout.write(self.style.WARNING(f'↻ Updated: {badge.icon} {badge.name}'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error with badge "{badge_data.get("name", "Unknown")}": {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Import complete!'))
        self.stdout.write(self.style.SUCCESS(f'   Created: {created_count} badges'))
        self.stdout.write(self.style.SUCCESS(f'   Updated: {updated_count} badges'))
        self.stdout.write(self.style.SUCCESS(f'   Total: {created_count + updated_count} badges'))
