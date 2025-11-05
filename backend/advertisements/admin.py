from django.contrib import admin
from django.utils.html import format_html
from .models import AdBanner


@admin.register(AdBanner)
class AdBannerAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'is_active',
        'media_preview',
        'size',
        'location_list',
        'stats_display',
        'ctr_display',
        'created_at'
    ]
    list_filter = ['is_active', 'size', 'created_at']
    search_fields = ['title', 'alt_text']
    readonly_fields = [
        'media_preview_large',
        'impressions',
        'clicks',
        'ctr_display',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'is_active')
        }),
        ('Media', {
            'fields': ('image', 'video', 'media_preview_large', 'alt_text'),
            'description': 'Upload either an image OR a video (not both). '
                         'Supported formats: Images (JPG, PNG, GIF), Videos (MP4, WebM)'
        }),
        ('Display Settings', {
            'fields': ('size', 'locations', 'link_url')
        }),
        ('Statistics', {
            'fields': ('impressions', 'clicks', 'ctr_display'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def media_preview(self, obj):
        """Small preview for list view"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 50px; border-radius: 4px;" />',
                obj.image.url
            )
        elif obj.video:
            return format_html(
                '<video style="max-width: 100px; max-height: 50px; border-radius: 4px;" muted>'
                '<source src="{}" type="video/mp4">🎥 Video</video>',
                obj.video.url
            )
        return "No media"
    media_preview.short_description = 'Preview'
    
    def media_preview_large(self, obj):
        """Large preview for detail view"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 500px; max-height: 300px; border-radius: 8px; '
                'box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />',
                obj.image.url
            )
        elif obj.video:
            return format_html(
                '<video controls style="max-width: 500px; max-height: 300px; border-radius: 8px; '
                'box-shadow: 0 2px 8px rgba(0,0,0,0.1);">'
                '<source src="{}" type="video/mp4">Your browser does not support video.</video>',
                obj.video.url
            )
        return "No media uploaded yet"
    media_preview_large.short_description = 'Media Preview'
    
    def location_list(self, obj):
        """Display locations in a readable format"""
        if not obj.locations:
            return "No locations"
        
        location_dict = dict(AdBanner.LOCATION_CHOICES)
        locations = [location_dict.get(loc, loc) for loc in obj.locations]
        return format_html('<br>'.join(['• ' + loc for loc in locations]))
    location_list.short_description = 'Locations'
    
    def stats_display(self, obj):
        """Display statistics"""
        return format_html(
            '👁 {} views<br>🖱 {} clicks',
            obj.impressions,
            obj.clicks
        )
    stats_display.short_description = 'Stats'
    
    def ctr_display(self, obj):
        """Display click-through rate"""
        ctr = obj.click_through_rate
        color = '#10b981' if ctr > 5 else '#f59e0b' if ctr > 2 else '#6b7280'
        ctr_formatted = f'{ctr:.2f}'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}%</span>',
            color,
            ctr_formatted
        )
    ctr_display.short_description = 'CTR'
    
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        """Customize form fields"""
        if db_field.name == 'locations':
            # Use CheckboxSelectMultiple for better UX
            from django import forms
            
            # Create a custom field that handles list to JSONField conversion
            class LocationField(forms.MultipleChoiceField):
                def prepare_value(self, value):
                    """Convert JSONField value (list) to form value"""
                    if isinstance(value, str):
                        import json
                        try:
                            value = json.loads(value)
                        except (json.JSONDecodeError, TypeError):
                            value = []
                    return value if isinstance(value, list) else []
            
            # Return the field directly, avoiding JSONField's encoder/decoder kwargs
            return LocationField(
                choices=AdBanner.LOCATION_CHOICES,
                widget=forms.CheckboxSelectMultiple(),
                required=False,
                label='Locations',
                help_text='Select where this banner should appear'
            )
            
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }

