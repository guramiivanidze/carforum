from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from forum.models import Category, Topic, Reply, UserProfile


class Command(BaseCommand):
    help = 'Populate database with sample forum data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # Create users
        users_data = [
            {'username': 'george_k', 'email': 'george@example.com', 'avatar': '👤', 'points': 120},
            {'username': 'anna_m', 'email': 'anna@example.com', 'avatar': '👨‍💼', 'points': 95},
            {'username': 'david_l', 'email': 'david@example.com', 'avatar': '👩', 'points': 210},
            {'username': 'sarah_p', 'email': 'sarah@example.com', 'avatar': '🧑', 'points': 87},
            {'username': 'mike_r', 'email': 'mike@example.com', 'avatar': '👨', 'points': 156},
            {'username': 'user123', 'email': 'user123@example.com', 'avatar': '🟣', 'points': 540},
            {'username': 'mariam_dev', 'email': 'mariam@example.com', 'avatar': '🔵', 'points': 420},
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={'email': user_data['email']}
            )
            if created:
                user.set_password('password123')
                user.save()
            
            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'avatar': user_data['avatar'],
                    'points': user_data['points']
                }
            )
            users.append(user)
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.username}'))
        
        # Create categories
        categories_data = [
            {'icon': '💬', 'title': 'General Discussion', 'description': 'Talk about anything'},
            {'icon': '🧑‍💻', 'title': 'Tech & Coding', 'description': 'Programming questions'},
            {'icon': '🚗', 'title': 'Cars', 'description': 'Car talk & questions'},
            {'icon': '📱', 'title': 'Mobile', 'description': 'Smartphones & apps'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                title=cat_data['title'],
                defaults={
                    'icon': cat_data['icon'],
                    'description': cat_data['description']
                }
            )
            categories.append(category)
            self.stdout.write(self.style.SUCCESS(f'Created category: {category.title}'))
        
        # Create topics
        topics_data = [
            {
                'title': 'How to deploy Django on Render?',
                'author': users[0],
                'category': categories[1],
                'content': 'I need help deploying my Django application to Render. What are the best practices?'
            },
            {
                'title': 'Best practices for React state management',
                'author': users[1],
                'category': categories[1],
                'content': 'What are your recommendations for managing state in large React applications?'
            },
            {
                'title': 'BMW vs Mercedes - Which is better?',
                'author': users[2],
                'category': categories[2],
                'content': 'I am looking to buy a luxury car. Should I go with BMW or Mercedes?'
            },
            {
                'title': 'iOS vs Android in 2025',
                'author': users[3],
                'category': categories[3],
                'content': 'Which mobile platform is better in 2025? Let\'s discuss the pros and cons.'
            },
            {
                'title': 'What are your favorite productivity apps?',
                'author': users[4],
                'category': categories[0],
                'content': 'Share your favorite productivity apps and tools that help you stay organized.'
            },
            {
                'title': 'AI testing tools',
                'author': users[5],
                'category': categories[1],
                'content': 'What AI-powered testing tools are you using in your projects?'
            },
            {
                'title': 'Best hosting for Django?',
                'author': users[6],
                'category': categories[1],
                'content': 'Looking for reliable and affordable Django hosting solutions. Any recommendations?'
            },
        ]
        
        for topic_data in topics_data:
            topic, created = Topic.objects.get_or_create(
                title=topic_data['title'],
                defaults={
                    'author': topic_data['author'],
                    'category': topic_data['category'],
                    'content': topic_data['content'],
                    'views': 0
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created topic: {topic.title}'))
                
                # Create some sample replies
                for i in range(3):
                    Reply.objects.create(
                        topic=topic,
                        author=users[(i + 1) % len(users)],
                        content=f'This is a sample reply #{i+1} to the topic.'
                    )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data!'))
