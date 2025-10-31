import os
import sys
import django

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'carforum_backend.settings')
django.setup()

from forum.models import ReportReason

# Default report reasons
reasons = [
    {
        'title': 'Spam or advertising',
        'description': 'Unwanted commercial content or repetitive messages',
        'order': 1
    },
    {
        'title': 'Harassment or bullying',
        'description': 'Content that threatens, harasses, or bullies others',
        'order': 2
    },
    {
        'title': 'Hate speech or discrimination',
        'description': 'Content promoting hate against people based on identity',
        'order': 3
    },
    {
        'title': 'Inappropriate content',
        'description': 'Content that is offensive, vulgar, or not suitable',
        'order': 4
    },
    {
        'title': 'Misinformation',
        'description': 'False or misleading information',
        'order': 5
    },
    {
        'title': 'Off-topic or irrelevant',
        'description': 'Content that does not relate to the discussion',
        'order': 6
    },
    {
        'title': 'Other',
        'description': 'Other reasons not listed above',
        'order': 7
    },
]

for reason_data in reasons:
    reason, created = ReportReason.objects.get_or_create(
        title=reason_data['title'],
        defaults={
            'description': reason_data['description'],
            'order': reason_data['order'],
            'is_active': True
        }
    )
    if created:
        print(f"Created: {reason.title}")
    else:
        print(f"Already exists: {reason.title}")

print("\nAll report reasons are set up!")
