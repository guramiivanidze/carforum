from django.contrib import admin
from .models import Level, UserLevel, Badge, UserBadge, UserStreak


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ['level_number', 'name', 'xp_required', 'icon', 'color', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    list_editable = ['is_active']
    ordering = ['level_number']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('level_number', 'name', 'xp_required')
        }),
        ('Display', {
            'fields': ('icon', 'image', 'color'),
            'description': 'Icon will be used if no image is uploaded. Upload an image for custom level badges.'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(UserLevel)
class UserLevelAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'level_name', 'xp', 'current_xp', 'xp_to_next_level', 'created_at']
    list_filter = ['level']
    search_fields = ['user__username']
    readonly_fields = ['level_name', 'created_at', 'updated_at', 'current_xp', 'xp_to_next_level', 'xp_progress_percentage', 'total_xp']
    ordering = ['-xp']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'category', 'requirement_count', 'xp_reward', 'is_active', 'order']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description', 'requirement']
    list_editable = ['is_active', 'order']
    ordering = ['order', 'name']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'progress', 'unlocked', 'progress_percentage', 'unlocked_at']
    list_filter = ['unlocked', 'badge__category', 'unlocked_at']
    search_fields = ['user__username', 'badge__name']
    readonly_fields = ['unlocked_at', 'progress_percentage']
    ordering = ['-unlocked_at', '-progress']


@admin.register(UserStreak)
class UserStreakAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_streak', 'longest_streak', 'last_activity_date', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-current_streak']

