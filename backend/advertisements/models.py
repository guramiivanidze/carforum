from django.db import models
from django.core.exceptions import ValidationError
from cloudinary.models import CloudinaryField


class AdBanner(models.Model):
    """Model for advertisement banners"""
    
    LOCATION_CHOICES = [
        ('home_between_sections', 'Home - Between Categories and Topics'),
        ('home_categories_grid', 'Home - Inside Categories Grid'),
        ('home_topics_list', 'Home - Inside Topics List'),
        ('sidebar_main', 'Sidebar - Between Popular Topics and Top Members'),
        ('category_header', 'Category Page - Between Header and Tabs'),
        ('category_topics_list', 'Category Page - Inside Topics List'),
        ('category_sidebar', 'Category Page - Sidebar Between Rules and Tags'),
        ('topic_before_replies', 'Topic Page - Between Active Users and Replies'),
        ('topic_sidebar', 'Topic Page - Sidebar After Thread Info'),
    ]
    
    SIZE_CHOICES = [
        ('small', 'Small (120px - Sidebar)'),
        ('medium', 'Medium (150px - Between sections)'),
        ('large', 'Large (200px - Major sections)'),
        ('card', 'Card (250px - Grid layouts)'),
        ('row', 'Row (100px - Inside lists)'),
    ]
    
    title = models.CharField(max_length=200, help_text="Internal name for this banner")
    is_active = models.BooleanField(default=True, help_text="Whether this banner is currently active")
    
    # Media fields - either image or video
    image = CloudinaryField(
        'image',
        blank=True,
        null=True,
        help_text="Upload an image for the banner (JPG, PNG, GIF)"
    )
    video = CloudinaryField(
        'video',
        blank=True,
        null=True,
        resource_type='video',
        help_text="Upload a video for the banner (MP4, WebM)"
    )
    
    # Link and content
    link_url = models.URLField(blank=True, help_text="URL to redirect when banner is clicked")
    alt_text = models.CharField(max_length=200, blank=True, help_text="Alt text for accessibility")
    
    # Location settings
    locations = models.JSONField(
        default=list,
        help_text="List of locations where this banner should appear"
    )
    
    size = models.CharField(
        max_length=20,
        choices=SIZE_CHOICES,
        default='medium',
        help_text="Size variant for the banner"
    )
    
    # Tracking
    impressions = models.IntegerField(default=0, help_text="Number of times banner was displayed")
    clicks = models.IntegerField(default=0, help_text="Number of times banner was clicked")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Ad Banner'
        verbose_name_plural = 'Ad Banners'
    
    def __str__(self):
        return f"{self.title} ({'Active' if self.is_active else 'Inactive'})"
    
    def clean(self):
        """Validate that banner has either image or video, but not both or neither"""
        if not self.image and not self.video:
            raise ValidationError("Banner must have either an image or a video.")
        
        if self.image and self.video:
            raise ValidationError("Banner cannot have both image and video. Choose one.")
        
        # Validate locations uniqueness
        if self.locations and self.is_active:
            # Check if any other active banner uses the same locations
            conflicting_banners = AdBanner.objects.filter(
                is_active=True
            ).exclude(id=self.id)
            
            for banner in conflicting_banners:
                if banner.locations:
                    # Check for overlapping locations
                    overlap = set(self.locations) & set(banner.locations)
                    if overlap:
                        location_names = [
                            dict(self.LOCATION_CHOICES).get(loc, loc) 
                            for loc in overlap
                        ]
                        raise ValidationError(
                            f"Cannot activate banner: Location(s) {', '.join(location_names)} "
                            f"already used by banner '{banner.title}'. "
                            "Deactivate that banner first or choose different locations."
                        )
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def click_through_rate(self):
        """Calculate CTR percentage"""
        if self.impressions == 0:
            return 0
        return (self.clicks / self.impressions) * 100
    
    @property
    def media_type(self):
        """Return the type of media (image or video)"""
        if self.image:
            return 'image'
        elif self.video:
            return 'video'
        return None
    
    @property
    def media_url(self):
        """Return the URL of the media file"""
        if self.image:
            return self.image.url
        elif self.video:
            return self.video.url
        return None

