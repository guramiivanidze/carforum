from django.contrib import admin
from .models import (
    Category, CategoryRule, Tag, Topic, Reply, UserProfile, ReportReason, Report, Bookmark,
    TopicImage, Poll, PollOption, PollVote
)


class CategoryRuleInline(admin.TabularInline):
    model = CategoryRule
    extra = 1
    fields = ['title', 'description', 'order', 'is_active']
    ordering = ['order', 'created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'icon', 'topics_count', 'created_at']
    search_fields = ['title', 'description']
    inlines = [CategoryRuleInline]


@admin.register(CategoryRule)
class CategoryRuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'category', 'created_at']
    search_fields = ['title', 'description', 'category__title']
    list_editable = ['order', 'is_active']
    ordering = ['category', 'order', 'created_at']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'usage_count', 'created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']


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


@admin.register(TopicImage)
class TopicImageAdmin(admin.ModelAdmin):
    list_display = ['topic', 'caption', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['topic__title', 'caption']
    readonly_fields = ['created_at']


class PollOptionInline(admin.TabularInline):
    model = PollOption
    extra = 2
    fields = ['text', 'order']


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['question', 'topic', 'total_votes', 'created_at']
    search_fields = ['question', 'topic__title']
    readonly_fields = ['created_at', 'total_votes']
    inlines = [PollOptionInline]


@admin.register(PollOption)
class PollOptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'poll', 'votes_count', 'percentage', 'order']
    list_filter = ['poll']
    search_fields = ['text', 'poll__question']
    readonly_fields = ['votes_count', 'percentage', 'created_at']


@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'poll_option', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'poll__option__text']
    readonly_fields = ['created_at']
