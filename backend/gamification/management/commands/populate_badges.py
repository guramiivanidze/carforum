from django.core.management.base import BaseCommand
from gamification.models import Badge


class Command(BaseCommand):
    help = 'Populate initial badges'

    def handle(self, *args, **kwargs):
        badges_data = [
            # Contribution Badges
            {
                'name': 'First Post',
                'icon': '📚',
                'category': 'contribution',
                'description': 'Created your first forum post',
                'requirement': 'Create 1 post',
                'requirement_count': 1,
                'xp_reward': 50,
                'order': 1
            },
            {
                'name': '10 Posts',
                'icon': '📝',
                'category': 'contribution',
                'description': 'Posted 10 topics in the forum',
                'requirement': 'Create 10 posts',
                'requirement_count': 10,
                'xp_reward': 100,
                'order': 2
            },
            {
                'name': '50 Posts',
                'icon': '✍️',
                'category': 'contribution',
                'description': 'Posted 50 topics in the forum',
                'requirement': 'Create 50 posts',
                'requirement_count': 50,
                'xp_reward': 250,
                'order': 3
            },
            {
                'name': '100 Replies',
                'icon': '💯',
                'category': 'contribution',
                'description': 'Reply to 100 topics',
                'requirement': 'Create 100 replies',
                'requirement_count': 100,
                'xp_reward': 300,
                'order': 4
            },
            {
                'name': 'Expert Mechanic',
                'icon': '🔧',
                'category': 'contribution',
                'description': 'Become an expert in automotive topics',
                'requirement': 'Create 200 posts/replies',
                'requirement_count': 200,
                'xp_reward': 500,
                'order': 5
            },
            
            # Social Badges
            {
                'name': '10 Likes',
                'icon': '👍',
                'category': 'social',
                'description': 'Received 10 likes on your posts',
                'requirement': 'Get 10 likes',
                'requirement_count': 10,
                'xp_reward': 50,
                'order': 6
            },
            {
                'name': '50 Likes',
                'icon': '❤️',
                'category': 'social',
                'description': 'Received 50 likes on your posts',
                'requirement': 'Get 50 likes',
                'requirement_count': 50,
                'xp_reward': 150,
                'order': 7
            },
            {
                'name': '100 Likes',
                'icon': '💖',
                'category': 'social',
                'description': 'Received 100 likes on your posts',
                'requirement': 'Get 100 likes',
                'requirement_count': 100,
                'xp_reward': 300,
                'order': 8
            },
            
            # Helpful Badges
            {
                'name': 'Helpful Contributor',
                'icon': '🏅',
                'category': 'helpful',
                'description': 'You helped 10 users get answers',
                'requirement': 'Help 10 users',
                'requirement_count': 10,
                'xp_reward': 100,
                'order': 9
            },
            {
                'name': 'Problem Solver',
                'icon': '🎯',
                'category': 'helpful',
                'description': 'Solved 25 user problems',
                'requirement': 'Help 25 users',
                'requirement_count': 25,
                'xp_reward': 200,
                'order': 10
            },
            {
                'name': 'Expert Helper',
                'icon': '⭐',
                'category': 'helpful',
                'description': 'Helped 50 users find solutions',
                'requirement': 'Help 50 users',
                'requirement_count': 50,
                'xp_reward': 400,
                'order': 11
            },
            
            # Streak Badges
            {
                'name': '3 Days Active',
                'icon': '🔥',
                'category': 'streaks',
                'description': 'Visited the forum for 3 consecutive days',
                'requirement': '3-day streak',
                'requirement_count': 3,
                'xp_reward': 30,
                'order': 12
            },
            {
                'name': '7 Days Active',
                'icon': '🌟',
                'category': 'streaks',
                'description': 'Visited the forum for 7 consecutive days',
                'requirement': '7-day streak',
                'requirement_count': 7,
                'xp_reward': 70,
                'order': 13
            },
            {
                'name': '30 Days Active',
                'icon': '🕒',
                'category': 'streaks',
                'description': 'Visit the forum for 30 consecutive days',
                'requirement': '30-day streak',
                'requirement_count': 30,
                'xp_reward': 300,
                'order': 14
            },
            {
                'name': '100 Days Active',
                'icon': '💎',
                'category': 'streaks',
                'description': 'Visit the forum for 100 consecutive days',
                'requirement': '100-day streak',
                'requirement_count': 100,
                'xp_reward': 1000,
                'order': 15
            },
            
            # Special Badges
            {
                'name': 'Early Adopter',
                'icon': '🚀',
                'category': 'special',
                'description': 'One of the first members of the forum',
                'requirement': 'Join in the first month',
                'requirement_count': 1,
                'xp_reward': 500,
                'order': 16
            },
            {
                'name': 'Forum Anniversary',
                'icon': '🏆',
                'category': 'special',
                'description': 'Celebrate 1 year on the forum',
                'requirement': 'Member for 1 year',
                'requirement_count': 365,
                'xp_reward': 1000,
                'order': 17
            },
            {
                'name': 'Bookworm',
                'icon': '📖',
                'category': 'special',
                'description': 'Bookmarked 50 topics',
                'requirement': 'Bookmark 50 topics',
                'requirement_count': 50,
                'xp_reward': 150,
                'order': 18
            },
            {
                'name': 'Moderator Friend',
                'icon': '🛡️',
                'category': 'special',
                'description': 'Helped moderate the forum',
                'requirement': 'Report 10 inappropriate posts',
                'requirement_count': 10,
                'xp_reward': 200,
                'order': 19
            },
        ]

        created_count = 0
        updated_count = 0

        for badge_data in badges_data:
            badge, created = Badge.objects.update_or_create(
                name=badge_data['name'],
                defaults=badge_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created badge: {badge.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated badge: {badge.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted! Created {created_count} badges, updated {updated_count} badges.'
            )
        )
