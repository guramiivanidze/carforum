from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Topic, Reply, UserProfile


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.CharField(source='profile.avatar', read_only=True)
    points = serializers.IntegerField(source='profile.points', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'points', 'date_joined']


class CategorySerializer(serializers.ModelSerializer):
    topics_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = ['id', 'icon', 'title', 'description', 'topics_count', 'created_at']


class ReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Reply
        fields = ['id', 'topic', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['author']


class TopicSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.title', read_only=True)
    replies_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Topic
        fields = ['id', 'title', 'author', 'category', 'category_name', 
                  'content', 'replies_count', 'views', 'created_at', 'updated_at']
        read_only_fields = ['author', 'views']


class TopicDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    replies_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Topic
        fields = ['id', 'title', 'author', 'category', 'content', 
                  'replies', 'replies_count', 'views', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'avatar', 'points', 'bio', 'user']
