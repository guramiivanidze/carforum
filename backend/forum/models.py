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


class Topic(models.Model):
    """Forum topics/posts"""
    title = models.CharField(max_length=300)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topics')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='topics')
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    @property
    def replies_count(self):
        return self.replies.count()


class Reply(models.Model):
    """Replies to topics"""
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Replies'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Reply to {self.topic.title} by {self.author.username}"


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.CharField(max_length=10, default='👤')
    points = models.IntegerField(default=0)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"
