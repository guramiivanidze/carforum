from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from gamification.services import GamificationService

User = get_user_model()


class Command(BaseCommand):
    help = 'Update topic likes badge progress for all users based on their existing topic likes'

    def handle(self, *args, **options):
        self.stdout.write('Updating topic likes badge progress...\n')
        
        # Get all users who have created topics
        from forum.models import Topic
        topic_authors = User.objects.filter(topics__isnull=False).distinct()
        
        updated_count = 0
        total_badges_unlocked = 0
        
        for user in topic_authors:
            user_topics = Topic.objects.filter(author=user)
            total_likes = sum(topic.likes.count() for topic in user_topics)
            max_likes_on_single_topic = max(
                (topic.likes.count() for topic in user_topics), 
                default=0
            )
            
            self.stdout.write(
                f'  User: {user.username} - {total_likes} total likes, '
                f'max {max_likes_on_single_topic} on single topic'
            )
            
            # Run the badge checking
            result = GamificationService.check_topic_likes_badges(user)
            badges_unlocked = result.get('badges_unlocked', [])
            
            if badges_unlocked:
                for badge in badges_unlocked:
                    self.stdout.write(
                        self.style.SUCCESS(f'    ✓ Unlocked {badge["name"]} badge!')
                    )
                    total_badges_unlocked += 1
            
            updated_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCompleted! Updated {updated_count} users, {total_badges_unlocked} badges unlocked.'
        ))
