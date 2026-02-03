from django.core.management.base import BaseCommand
from forum.models import Tag


class Command(BaseCommand):
    help = 'Clean up invalid tags with empty slugs or names'

    def handle(self, *args, **options):
        # Find and delete tags with empty slugs
        empty_slug_tags = Tag.objects.filter(slug='')
        count = empty_slug_tags.count()
        
        if count > 0:
            self.stdout.write(f'Found {count} tag(s) with empty slug')
            empty_slug_tags.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {count} invalid tag(s)'))
        else:
            self.stdout.write(self.style.SUCCESS('No invalid tags found'))
        
        # Also check for tags with empty names
        empty_name_tags = Tag.objects.filter(name='')
        count2 = empty_name_tags.count()
        
        if count2 > 0:
            self.stdout.write(f'Found {count2} tag(s) with empty name')
            empty_name_tags.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {count2} invalid tag(s)'))
