from django.contrib import admin
from .models import Category, Topic, Reply, UserProfile


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
