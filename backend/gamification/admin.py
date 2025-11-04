from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import Level, UserLevel, Badge, UserBadge, UserStreak


# Resources for import/export
class LevelResource(resources.ModelResource):
    class Meta:
        model = Level
        import_id_fields = ['level_number']
        fields = ('level_number', 'name', 'xp_required', 'icon', 'color', 'is_active')


class UserLevelResource(resources.ModelResource):
    class Meta:
        model = UserLevel
        import_id_fields = ['user']
        fields = ('user__username', 'xp', 'level', 'created_at', 'updated_at')


class BadgeResource(resources.ModelResource):
    class Meta:
        model = Badge
        import_id_fields = ['name']
        fields = ('name', 'icon', 'category', 'description', 'requirement', 'requirement_count', 'xp_reward', 'is_active', 'order')


class UserBadgeResource(resources.ModelResource):
    class Meta:
        model = UserBadge
        import_id_fields = ['user', 'badge']
        fields = ('user__username', 'badge__name', 'progress', 'unlocked', 'unlocked_at')


class UserStreakResource(resources.ModelResource):
    class Meta:
        model = UserStreak
        import_id_fields = ['user']
        fields = ('user__username', 'current_streak', 'longest_streak', 'last_activity_date', 'updated_at')


@admin.register(Level)
class LevelAdmin(ImportExportModelAdmin):
    resource_class = LevelResource
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
class UserLevelAdmin(ImportExportModelAdmin):
    resource_class = UserLevelResource
    list_display = ['user', 'level', 'level_name', 'xp', 'current_xp', 'xp_to_next_level', 'created_at']
    list_filter = ['level']
    search_fields = ['user__username']
    readonly_fields = ['level_name', 'created_at', 'updated_at', 'current_xp', 'xp_to_next_level', 'xp_progress_percentage', 'total_xp']
    ordering = ['-xp']


@admin.register(Badge)
class BadgeAdmin(ImportExportModelAdmin):
    resource_class = BadgeResource
    list_display = ['name', 'icon', 'category', 'requirement_count', 'xp_reward', 'is_active', 'order']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description', 'requirement']
    list_editable = ['is_active', 'order']
    ordering = ['order', 'name']


@admin.register(UserBadge)
class UserBadgeAdmin(ImportExportModelAdmin):
    resource_class = UserBadgeResource
    list_display = ['user', 'badge', 'progress', 'unlocked', 'progress_percentage', 'unlocked_at']
    list_filter = ['unlocked', 'badge__category', 'unlocked_at']
    search_fields = ['user__username', 'badge__name']
    readonly_fields = ['unlocked_at', 'progress_percentage']
    ordering = ['-unlocked_at', '-progress']


@admin.register(UserStreak)
class UserStreakAdmin(ImportExportModelAdmin):
    resource_class = UserStreakResource
    list_display = ['user', 'current_streak', 'longest_streak', 'last_activity_date', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-current_streak']
