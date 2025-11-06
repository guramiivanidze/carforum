from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import (
    Category, CategoryRule, Tag, Topic, Reply, UserProfile, ReportReason, Report, Bookmark,
    TopicImage, Poll, PollOption, PollVote, ReplyImage
)


# Resources for import/export
class CategoryResource(resources.ModelResource):
    class Meta:
        model = Category
        import_id_fields = ['id']
        fields = ('id', 'title', 'description', 'icon', 'topics_count', 'created_at')


class CategoryRuleResource(resources.ModelResource):
    class Meta:
        model = CategoryRule
        import_id_fields = ['id']
        fields = ('id', 'category__title', 'title', 'description', 'order', 'is_active', 'created_at')


class TagResource(resources.ModelResource):
    class Meta:
        model = Tag
        import_id_fields = ['slug']
        fields = ('name', 'slug', 'usage_count', 'created_at')


class TopicResource(resources.ModelResource):
    class Meta:
        model = Topic
        import_id_fields = ['id']
        fields = ('id', 'title', 'content', 'author__username', 'category__title', 'views', 'created_at', 'updated_at')


class ReplyResource(resources.ModelResource):
    class Meta:
        model = Reply
        import_id_fields = ['id']
        fields = ('id', 'topic__title', 'author__username', 'content', 'is_hidden', 'created_at')


class UserProfileResource(resources.ModelResource):
    class Meta:
        model = UserProfile
        import_id_fields = ['user']
        fields = ('user__username', 'bio', 'location', 'website', 'points', 'avatar_image')


class BookmarkResource(resources.ModelResource):
    class Meta:
        model = Bookmark
        import_id_fields = ['id']
        fields = ('id', 'user__username', 'topic__title', 'created_at')


class ReportReasonResource(resources.ModelResource):
    class Meta:
        model = ReportReason
        import_id_fields = ['id']
        fields = ('id', 'title', 'description', 'is_active', 'order')


class ReportResource(resources.ModelResource):
    class Meta:
        model = Report
        import_id_fields = ['id']
        fields = ('id', 'reporter__username', 'reply__id', 'reason__title', 'status', 'additional_info', 'created_at', 'reviewed_by__username', 'reviewed_at')


class TopicImageResource(resources.ModelResource):
    class Meta:
        model = TopicImage
        import_id_fields = ['id']
        fields = ('id', 'topic__title', 'caption', 'order', 'created_at')


class PollResource(resources.ModelResource):
    class Meta:
        model = Poll
        import_id_fields = ['id']
        fields = ('id', 'topic__title', 'question', 'created_at')


class PollOptionResource(resources.ModelResource):
    class Meta:
        model = PollOption
        import_id_fields = ['id']
        fields = ('id', 'poll__question', 'text', 'order', 'created_at')


class PollVoteResource(resources.ModelResource):
    class Meta:
        model = PollVote
        import_id_fields = ['id']
        fields = ('id', 'user__username', 'poll_option__text', 'created_at')


class CategoryRuleInline(admin.TabularInline):
    model = CategoryRule
    extra = 1
    fields = ['title', 'description', 'order', 'is_active']
    ordering = ['order', 'created_at']


@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin):
    resource_class = CategoryResource
    list_display = ['title', 'icon', 'topics_count', 'created_at']
    search_fields = ['title', 'description']
    inlines = [CategoryRuleInline]


@admin.register(CategoryRule)
class CategoryRuleAdmin(ImportExportModelAdmin):
    resource_class = CategoryRuleResource
    list_display = ['title', 'category', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'category', 'created_at']
    search_fields = ['title', 'description', 'category__title']
    list_editable = ['order', 'is_active']
    ordering = ['category', 'order', 'created_at']


@admin.register(Tag)
class TagAdmin(ImportExportModelAdmin):
    resource_class = TagResource
    list_display = ['name', 'slug', 'usage_count', 'created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']


@admin.register(Topic)
class TopicAdmin(ImportExportModelAdmin):
    resource_class = TopicResource
    list_display = ['title', 'author', 'category', 'replies_count', 'likes_count', 'views', 'created_at', 'updated_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'content', 'author__username']
    readonly_fields = ['views', 'created_at', 'updated_at', 'likes_list']
    filter_horizontal = ['likes']
    fieldsets = (
        (None, {
            'fields': ('title', 'author', 'category', 'content', 'tags')
        }),
    )
    
    def likes_count(self, obj):
        return obj.likes.count()
    likes_count.short_description = 'Likes'
    
    def likes_list(self, obj):
        """Show all users who liked this topic"""
        users = obj.likes.all()
        if users:
            return ', '.join([user.username for user in users])
        return 'No likes yet'
    likes_list.short_description = 'Users who liked'


@admin.register(Reply)
class ReplyAdmin(ImportExportModelAdmin):
    resource_class = ReplyResource
    list_display = ['topic', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username', 'topic__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserProfile)
class UserProfileAdmin(ImportExportModelAdmin):
    resource_class = UserProfileResource
    list_display = ['user', 'points', 'bio']
    search_fields = ['user__username', 'user__email']


@admin.register(Bookmark)
class BookmarkAdmin(ImportExportModelAdmin):
    resource_class = BookmarkResource
    list_display = ['user', 'topic', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'topic__title']
    readonly_fields = ['created_at']


@admin.register(ReportReason)
class ReportReasonAdmin(ImportExportModelAdmin):
    resource_class = ReportReasonResource
    list_display = ['title', 'is_active', 'order', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title', 'description']
    list_editable = ['is_active', 'order']


@admin.register(Report)
class ReportAdmin(ImportExportModelAdmin):
    resource_class = ReportResource
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
class TopicImageAdmin(ImportExportModelAdmin):
    resource_class = TopicImageResource
    list_display = ['topic', 'caption', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['topic__title', 'caption']
    readonly_fields = ['created_at']


class PollOptionInline(admin.TabularInline):
    model = PollOption
    extra = 2
    fields = ['text', 'order']


@admin.register(Poll)
class PollAdmin(ImportExportModelAdmin):
    resource_class = PollResource
    list_display = ['question', 'topic', 'total_votes', 'created_at']
    search_fields = ['question', 'topic__title']
    readonly_fields = ['created_at', 'total_votes']
    inlines = [PollOptionInline]


@admin.register(PollOption)
class PollOptionAdmin(ImportExportModelAdmin):
    resource_class = PollOptionResource
    list_display = ['text', 'poll', 'votes_count', 'percentage', 'order']
    list_filter = ['poll']
    search_fields = ['text', 'poll__question']
    readonly_fields = ['votes_count', 'percentage', 'created_at']


@admin.register(PollVote)
class PollVoteAdmin(ImportExportModelAdmin):
    resource_class = PollVoteResource
    list_display = ['user', 'poll_option', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'poll__option__text']
    readonly_fields = ['created_at']


@admin.register(ReplyImage)
class ReplyImageAdmin(admin.ModelAdmin):
    list_display = ['reply', 'caption', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['caption', 'reply__content']
    readonly_fields = ['created_at']
