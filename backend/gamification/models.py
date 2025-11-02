from django.db import models
from django.contrib.auth.models import User


class UserLevel(models.Model):
    """User levels and XP tracking"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='level')
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    level_name = models.CharField(max_length=50, default='Newbie')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-xp']
    
    def __str__(self):
        return f"{self.user.username} - Level {self.level} ({self.level_name})"
    
    @property
    def current_xp(self):
        """Get XP progress in current level"""
        current_level_min_xp = (self.level - 1) * 500
        return self.xp - current_level_min_xp
    
    @property
    def xp_to_next_level(self):
        """Calculate XP needed for next level"""
        return 500  # Each level requires 500 XP
    
    @property
    def xp_progress_percentage(self):
        """Calculate progress percentage to next level"""
        return (self.current_xp / self.xp_to_next_level) * 100 if self.xp_to_next_level > 0 else 0
    
    @property
    def total_xp(self):
        """Total XP including all levels"""
        return self.xp
    
    def add_xp(self, amount):
        """Add XP and check for level up"""
        self.xp += amount
        self.check_level_up()
        self.save()
    
    def check_level_up(self):
        """Check if user should level up"""
        while self.xp >= (self.level * 500):
            self.level += 1
            self.update_level_name()
    
    def update_level_name(self):
        """Update level name based on current level"""
        level_names = {
            1: 'Newbie',
            2: 'Beginner',
            3: 'Member',
            4: 'Active Member',
            5: 'Contributor',
            6: 'Regular',
            7: 'Expert',
            8: 'Veteran',
            9: 'Master',
            10: 'Legend'
        }
        if self.level <= 10:
            self.level_name = level_names.get(self.level, 'Member')
        elif self.level <= 20:
            self.level_name = 'Elite'
        else:
            self.level_name = 'Legendary'


class Badge(models.Model):
    """Badge definitions"""
    CATEGORY_CHOICES = [
        ('contribution', 'Contribution'),
        ('social', 'Social'),
        ('helpful', 'Helpful'),
        ('streaks', 'Streaks'),
        ('special', 'Special'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default='🏅')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='contribution')
    description = models.TextField()
    requirement = models.TextField()
    requirement_count = models.IntegerField(default=1)
    xp_reward = models.IntegerField(default=50)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.icon} {self.name}"


class UserBadge(models.Model):
    """Badges earned by users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='earned_by')
    progress = models.IntegerField(default=0)
    unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'badge']
        ordering = ['-unlocked_at', '-progress']
    
    def __str__(self):
        status = 'Unlocked' if self.unlocked else f'Progress: {self.progress}/{self.badge.requirement_count}'
        return f"{self.user.username} - {self.badge.name} ({status})"
    
    @property
    def progress_percentage(self):
        """Calculate progress percentage"""
        if self.badge.requirement_count == 0:
            return 100
        return (self.progress / self.badge.requirement_count) * 100
    
    def update_progress(self, increment=1):
        """Update progress and check if badge should be unlocked"""
        if self.unlocked:
            return
        
        self.progress += increment
        if self.progress >= self.badge.requirement_count:
            self.unlock_badge()
        else:
            self.save()
    
    def unlock_badge(self):
        """Unlock the badge and award XP"""
        from django.utils import timezone
        self.unlocked = True
        self.unlocked_at = timezone.now()
        self.progress = self.badge.requirement_count
        self.save()
        
        # Award XP to user
        user_level, created = UserLevel.objects.get_or_create(user=self.user)
        user_level.add_xp(self.badge.xp_reward)


class UserStreak(models.Model):
    """Track user activity streaks"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.current_streak} days streak"
    
    def update_streak(self):
        """Update streak based on activity"""
        from django.utils import timezone
        today = timezone.now().date()
        
        if self.last_activity_date is None:
            # First activity
            self.current_streak = 1
            self.longest_streak = 1
            self.last_activity_date = today
        elif self.last_activity_date == today:
            # Already counted today
            return
        elif (today - self.last_activity_date).days == 1:
            # Consecutive day
            self.current_streak += 1
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak
            self.last_activity_date = today
        else:
            # Streak broken
            self.current_streak = 1
            self.last_activity_date = today
        
        self.save()

