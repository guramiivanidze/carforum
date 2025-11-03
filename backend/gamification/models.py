from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


class Level(models.Model):
    """Level definitions with XP thresholds"""
    level_number = models.IntegerField(unique=True)
    name = models.CharField(max_length=50)
    xp_required = models.IntegerField(help_text='Total XP required to reach this level')
    icon = models.CharField(max_length=10, default='⭐', blank=True)
    image = CloudinaryField('image', null=True, blank=True, folder='level_images', help_text='Custom level image (optional, falls back to icon)')
    color = models.CharField(max_length=7, default='#3b82f6', help_text='Hex color code')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['level_number']
    
    def __str__(self):
        return f"Level {self.level_number}: {self.name} ({self.xp_required} XP)"


class UserLevel(models.Model):
    """User levels and XP tracking"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='level')
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-xp']
    
    def __str__(self):
        return f"{self.user.username} - Level {self.level} ({self.level_name})"
    
    @property
    def level_name(self):
        """Get level name from Level model"""
        level_obj = self.current_level_obj
        return level_obj.name if level_obj else 'Newbie'
    
    @property
    def current_level_obj(self):
        """Get the Level object for current level"""
        return Level.objects.filter(level_number=self.level, is_active=True).first()
    
    @property
    def next_level_obj(self):
        """Get the Level object for next level"""
        return Level.objects.filter(level_number=self.level + 1, is_active=True).first()
    
    @property
    def current_xp(self):
        """Get XP progress in current level"""
        current_level = self.current_level_obj
        if current_level:
            return self.xp - current_level.xp_required
        return self.xp
    
    @property
    def xp_to_next_level(self):
        """Calculate XP needed for next level"""
        next_level = self.next_level_obj
        if next_level:
            return next_level.xp_required - self.xp
        return 0  # Already at max level
    
    @property
    def xp_progress_percentage(self):
        """Calculate progress percentage to next level"""
        current_level = self.current_level_obj
        next_level = self.next_level_obj
        
        if not next_level:
            return 100  # Max level reached
        
        if current_level:
            level_xp_range = next_level.xp_required - current_level.xp_required
            current_progress = self.xp - current_level.xp_required
        else:
            level_xp_range = next_level.xp_required
            current_progress = self.xp
        
        if level_xp_range > 0:
            return (current_progress / level_xp_range) * 100
        return 0
    
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
        """Check if user should level up based on Level model"""
        # Get all levels the user qualifies for
        qualified_levels = Level.objects.filter(
            xp_required__lte=self.xp,
            is_active=True
        ).order_by('-level_number')
        
        if qualified_levels.exists():
            highest_level = qualified_levels.first()
            if highest_level.level_number > self.level:
                self.level = highest_level.level_number


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

