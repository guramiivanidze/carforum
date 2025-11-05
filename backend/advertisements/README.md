# Advertisements App

Django app for managing advertisement banners throughout the CarForum website.

## Features

- **Media Support**: Upload images (JPG, PNG, GIF) or videos (MP4, WebM)
- **Location Management**: Select multiple locations for banner placement
- **Location Protection**: Cannot have multiple active banners in the same location
- **Size Variants**: 5 different sizes for different placements (small, medium, large, card, row)
- **Click Tracking**: Track impressions and clicks for each banner
- **Admin Interface**: Full-featured admin with previews and statistics

## Available Locations

1. **home_between_sections** - Home: Between Categories and Topics
2. **home_categories_grid** - Home: Inside Categories Grid
3. **home_topics_list** - Home: Inside Topics List
4. **sidebar_main** - Sidebar: Between Popular Topics and Top Members
5. **category_header** - Category Page: Between Header and Tabs
6. **category_topics_list** - Category Page: Inside Topics List
7. **category_sidebar** - Category Page: Sidebar Between Rules and Tags
8. **topic_before_replies** - Topic Page: Between Active Users and Replies
9. **topic_sidebar** - Topic Page: Sidebar After Thread Info

## Size Variants

- **small** (120px) - For sidebars
- **medium** (150px) - Between sections
- **large** (200px) - Major section dividers
- **card** (250px) - For grid layouts
- **row** (100px) - Inside content lists

## API Endpoints

### Get All Active Banners
```
GET /api/advertisements/banners/
```

### Get Banners by Location
```
GET /api/advertisements/banners/?location=home_between_sections
```

### Track Impression
```
POST /api/advertisements/banners/{id}/track_impression/
```

### Track Click
```
POST /api/advertisements/banners/{id}/track_click/
```

### Get Statistics (Admin only)
```
GET /api/advertisements/banners/stats/
```

## Admin Usage

1. Navigate to Django Admin → Ad Banners
2. Click "Add Ad Banner"
3. Fill in:
   - Title (internal name)
   - Upload either image OR video (not both)
   - Select size variant
   - Select locations (check multiple boxes)
   - Add link URL (optional)
   - Add alt text for accessibility
4. Save

### Important Notes

- You must upload either an image OR a video, not both
- You cannot activate a banner if another active banner uses the same location
- To change locations, deactivate conflicting banners first
- Statistics (impressions, clicks, CTR) are tracked automatically

## Model Fields

### AdBanner Model

- `title` - Internal name for the banner
- `is_active` - Whether banner is currently active
- `image` - Cloudinary image field
- `video` - Cloudinary video field
- `link_url` - URL to redirect on click
- `alt_text` - Accessibility text
- `locations` - JSON list of location keys
- `size` - Size variant choice
- `impressions` - View count (auto-tracked)
- `clicks` - Click count (auto-tracked)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Validation Rules

1. Banner must have either image or video (not neither, not both)
2. Active banners cannot share the same location
3. Locations must be from the predefined choices

## Frontend Integration

The frontend `AdBanner` component needs to be updated to:
1. Fetch banners by location from the API
2. Display image or video based on media_type
3. Handle link clicks
4. Track impressions when banner is displayed
5. Track clicks when banner is clicked

Example API call:
```javascript
// Fetch banner for specific location
const response = await fetch('/api/advertisements/banners/?location=home_between_sections');
const banners = await response.json();

// Track impression
await fetch(`/api/advertisements/banners/${bannerId}/track_impression/`, {
  method: 'POST'
});

// Track click
await fetch(`/api/advertisements/banners/${bannerId}/track_click/`, {
  method: 'POST'
});
```
