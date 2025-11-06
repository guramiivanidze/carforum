from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


class Category(models.Model):
    """Forum categories"""
    icon = models.CharField(max_length=10, default='💬')
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['title']
    
    def __str__(self):
        return self.title
    
    @property
    def topics_count(self):
        return self.topics.count()


class CategoryRule(models.Model):
    """Rules for categories"""
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='rules')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Category Rule'
        verbose_name_plural = 'Category Rules'
    
    def __str__(self):
        return f"{self.category.title} - {self.title}"


class Tag(models.Model):
    """Tags for topics"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def usage_count(self):
        """Count how many topics use this tag"""
        return self.topics.count()


class Topic(models.Model):
    """Forum topics/posts"""
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topics')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='topics')
    content = models.TextField(blank=True)
    tags = models.ManyToManyField(Tag, related_name='topics', blank=True)
    likes = models.ManyToManyField(User, related_name='liked_topics', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    @property
    def replies_count(self):
        return self.replies.filter(is_hidden=False).count()
    
    @property
    def likes_count(self):
        return self.likes.count()


class Reply(models.Model):
    """Replies to topics"""
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='child_replies', null=True, blank=True)
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_replies', blank=True)
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Replies'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Reply to {self.topic.title} by {self.author.username}"
    
    @property
    def replies_count(self):
        return self.child_replies.filter(is_hidden=False).count()
    
    @property
    def likes_count(self):
        return self.likes.count()


class ReplyImage(models.Model):
    """Images attached to replies"""
    reply = models.ForeignKey(Reply, on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField('image', folder='reply_images')
    caption = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"Image for reply {self.reply.id}"


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_image = CloudinaryField('image', null=True, blank=True, folder='user_images')
    points = models.IntegerField(default=0)
    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True, help_text='Comma-separated list of skills')
    facebook_url = models.URLField(max_length=500, blank=True, null=True)
    linkedin_url = models.URLField(max_length=500, blank=True, null=True)
    tiktok_url = models.URLField(max_length=500, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"


class Follow(models.Model):
    """Represents a follower relationship between users.

    follower -> the user who follows
    following -> the user being followed
    """
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_set')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers_set')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} -> {self.following.username}"


class Bookmark(models.Model):
    """User bookmarks for topics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'topic']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} bookmarked {self.topic.title}"


class ReportReason(models.Model):
    """Reasons for reporting content"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'title']
    
    def __str__(self):
        return self.title


class Report(models.Model):
    """Reports for replies"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    reply = models.ForeignKey(Reply, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    reason = models.ForeignKey(ReportReason, on_delete=models.SET_NULL, null=True, related_name='reports')
    additional_info = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_reports')
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['reply', 'reporter']  # Prevent duplicate reports
    
    def __str__(self):
        return f"Report by {self.reporter.username} - {self.reason.title if self.reason else 'No reason'}"


class TopicImage(models.Model):
    """Images attached to topics"""
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField('image', folder='topic_images')
    caption = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"Image for {self.topic.title}"


class Poll(models.Model):
    """Polls attached to topics"""
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name='poll')
    question = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Poll: {self.question}"
    
    @property
    def total_votes(self):
        return sum(option.votes_count for option in self.options.all())


class PollOption(models.Model):
    """Options for polls"""
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.text} ({self.votes_count} votes)"
    
    @property
    def votes_count(self):
        return self.votes.count()
    
    @property
    def percentage(self):
        total = self.poll.total_votes
        if total == 0:
            return 0
        return round((self.votes_count / total) * 100, 1)


class PollVote(models.Model):
    """User votes on poll options"""
    poll_option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='poll_votes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['poll_option', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} voted for {self.poll_option.text}"


class SiteSettings(models.Model):
    """Singleton model for site-wide settings manageable from admin panel"""
    
    # SEO Settings
    site_title = models.CharField(max_length=200, default='CarForum - Automotive Discussion Community')
    site_description = models.TextField(default='Join CarForum to discuss cars, share experiences, and connect with automotive enthusiasts.')
    site_keywords = models.TextField(
        default='car forum, automotive discussion, car community, vehicle talk',
        help_text='Comma-separated keywords for SEO'
    )
    google_verification = models.CharField(max_length=100, blank=True, help_text='Google Search Console verification code')
    yandex_verification = models.CharField(max_length=100, blank=True, help_text='Yandex Webmaster verification code')
    bing_verification = models.CharField(max_length=100, blank=True, help_text='Bing Webmaster verification code')
    
    # Open Graph / Social Media
    og_image = CloudinaryField('image', blank=True, null=True, help_text='Default Open Graph image for social sharing')
    twitter_handle = models.CharField(max_length=50, blank=True, help_text='Twitter/X handle (without @)')
    facebook_url = models.URLField(blank=True, help_text='Facebook page URL')
    instagram_url = models.URLField(blank=True, help_text='Instagram profile URL')
    youtube_url = models.URLField(blank=True, help_text='YouTube channel URL')
    
    # Site URLs
    site_url = models.URLField(default='http://localhost:3000', help_text='Main site URL (for canonical URLs and sitemap)')
    api_url = models.URLField(default='http://localhost:8000', help_text='API base URL')
    
    # Site Configuration
    maintenance_mode = models.BooleanField(default=False, help_text='Enable maintenance mode')
    maintenance_message = models.TextField(
        default='We are currently performing maintenance. Please check back soon.',
        help_text='Message to display during maintenance'
    )
    registration_enabled = models.BooleanField(default=True, help_text='Allow new user registrations')
    registration_message = models.TextField(
        blank=True,
        help_text='Optional message to display when registration is disabled'
    )
    
    # Pagination
    topics_per_page = models.IntegerField(default=20, help_text='Number of topics per page')
    replies_per_page = models.IntegerField(default=10, help_text='Number of replies per page')
    
    # Analytics
    google_analytics_id = models.CharField(max_length=50, blank=True, help_text='Google Analytics tracking ID (e.g., G-XXXXXXXXXX)')
    google_tag_manager_id = models.CharField(max_length=50, blank=True, help_text='Google Tag Manager ID (e.g., GTM-XXXXXXX)')
    
    # Email Settings
    contact_email = models.EmailField(default='support@carforum.com', help_text='Contact email for inquiries')
    admin_email = models.EmailField(default='admin@carforum.com', help_text='Admin email for notifications')
    
    # Announcement Banner
    show_announcement = models.BooleanField(default=False, help_text='Show announcement banner')
    announcement_text = models.TextField(blank=True, help_text='Announcement banner text')
    announcement_type = models.CharField(
        max_length=20,
        choices=[
            ('info', 'Info'),
            ('warning', 'Warning'),
            ('success', 'Success'),
            ('error', 'Error'),
        ],
        default='info',
        help_text='Announcement banner style'
    )
    announcement_link = models.URLField(blank=True, help_text='Optional link for the announcement')
    announcement_link_text = models.CharField(max_length=100, blank=True, help_text='Text for the announcement link')
    
    # Moderation
    auto_hide_reported_replies = models.IntegerField(
        default=5,
        help_text='Automatically hide replies after this many reports (0 to disable)'
    )
    require_email_verification = models.BooleanField(default=False, help_text='Require email verification for new users')
    
    # Content Settings
    allow_topic_images = models.BooleanField(default=True, help_text='Allow images in topics')
    allow_polls = models.BooleanField(default=True, help_text='Allow polls in topics')
    max_images_per_topic = models.IntegerField(default=5, help_text='Maximum images per topic')
    max_poll_options = models.IntegerField(default=10, help_text='Maximum poll options')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'
    
    def __str__(self):
        return 'Site Settings'
    
    def save(self, *args, **kwargs):
        """Ensure only one instance exists (Singleton pattern)"""
        self.pk = 1
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Prevent deletion"""
        pass
    
    @classmethod
    def load(cls):
        """Load the singleton instance"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
