from django.core.management.base import BaseCommand
from django.utils.text import slugify
from forum.models import Topic, Tag


class Command(BaseCommand):
    help = 'Sync tags from existing topics to Tag model'

    def handle(self, *args, **options):
        self.stdout.write('Starting tag synchronization...')
        
        # Get all unique tags from topics
        all_tags = set()
        topics = Topic.objects.all()
        
        for topic in topics:
            if topic.tags:
                for tag_name in topic.tags:
                    all_tags.add(tag_name.lower().strip())
        
        self.stdout.write(f'Found {len(all_tags)} unique tags in topics')
        
        # Create Tag objects for each unique tag
        created_count = 0
        existing_count = 0
        
        for tag_name in all_tags:
            slug = slugify(tag_name)
            tag, created = Tag.objects.get_or_create(
                name=tag_name,
                defaults={'slug': slug}
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created tag: {tag_name}'))
            else:
                existing_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'\n✨ Tag synchronization complete!'))
        self.stdout.write(f'  • Created: {created_count} new tags')
        self.stdout.write(f'  • Existing: {existing_count} tags')
        self.stdout.write(f'  • Total: {len(all_tags)} tags')
