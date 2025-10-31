from django.contrib import admin
from .models import Category, Topic, Reply, UserProfile, ReportReason, Report, Bookmark


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'icon', 'topics_count', 'created_at']
    search_fields = ['title', 'description']


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'replies_count', 'views', 'created_at', 'updated_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'content', 'author__username']
    readonly_fields = ['views', 'created_at', 'updated_at']


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ['topic', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username', 'topic__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'avatar', 'points']
    search_fields = ['user__username', 'user__email']


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ['user', 'topic', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'topic__title']
    readonly_fields = ['created_at']


@admin.register(ReportReason)
class ReportReasonAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'order', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title', 'description']
    list_editable = ['is_active', 'order']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'reply', 'reason', 'status', 'created_at', 'reviewed_by']
    list_filter = ['status', 'created_at', 'reason']
    search_fields = ['reporter__username', 'reply__content', 'additional_info']
    readonly_fields = ['reporter', 'reply', 'created_at']
    list_editable = ['status']
    
    fieldsets = (
        ('Report Information', {
            'fields': ('reporter', 'reply', 'reason', 'additional_info')
        }),
        ('Status', {
            'fields': ('status', 'reviewed_by', 'reviewed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            if obj.status in ['reviewed', 'resolved', 'dismissed']:
                if not obj.reviewed_by:
                    obj.reviewed_by = request.user
                if not obj.reviewed_at:
                    from django.utils import timezone
                    obj.reviewed_at = timezone.now()
            
            # Hide the reply if status is resolved
            if obj.status == 'resolved':
                obj.reply.is_hidden = True
                obj.reply.save()
        super().save_model(request, obj, form, change)
