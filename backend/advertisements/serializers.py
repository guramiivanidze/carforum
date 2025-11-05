from rest_framework import serializers
from .models import AdBanner


class AdBannerSerializer(serializers.ModelSerializer):
    """Serializer for AdBanner model"""
    media_type = serializers.ReadOnlyField()
    media_url = serializers.ReadOnlyField()
    click_through_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = AdBanner
        fields = [
            'id',
            'title',
            'is_active',
            'image',
            'video',
            'media_type',
            'media_url',
            'link_url',
            'alt_text',
            'locations',
            'size',
            'impressions',
            'clicks',
            'click_through_rate',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['impressions', 'clicks', 'created_at', 'updated_at']


class AdBannerPublicSerializer(serializers.ModelSerializer):
    """Public serializer for displaying banners (limited fields)"""
    media_type = serializers.ReadOnlyField()
    media_url = serializers.ReadOnlyField()
    
    class Meta:
        model = AdBanner
        fields = [
            'id',
            'media_type',
            'media_url',
            'link_url',
            'alt_text',
            'size',
            'locations',  # Add locations field so frontend can organize banners
        ]
