# Generated migration to remove gamification models from forum app state
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('forum', '0013_alter_topic_tags'),
    ]

    operations = [
        # State-only operations - remove models from migration state without touching database
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(name='Badge'),
                migrations.DeleteModel(name='UserBadge'),
                migrations.DeleteModel(name='UserLevel'),
                migrations.DeleteModel(name='UserStreak'),
            ],
            database_operations=[
                # No database operations - tables already exist in gamification app
            ],
        ),
    ]
