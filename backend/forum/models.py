from django.db import models
from django.contrib.auth.models import User


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


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_image = models.ImageField(upload_to='user_images/', null=True, blank=True)
    points = models.IntegerField(default=0)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"


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
    image = models.ImageField(upload_to='topic_images/%Y/%m/%d/')
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

        
        self.save()
