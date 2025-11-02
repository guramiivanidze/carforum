# Generated migration for converting tags from JSONField to ManyToManyField
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('forum', '0012_tag'),
    ]

    operations = [
        # Remove the old JSONField
        migrations.RemoveField(
            model_name='topic',
            name='tags',
        ),
        # Add the new ManyToManyField
        migrations.AddField(
            model_name='topic',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='topics', to='forum.tag'),
        ),
    ]
