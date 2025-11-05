# Advertisement Banners - Setup Complete! ✅

## What Was Created

### Backend (Django App)
- ✅ New `advertisements` app created
- ✅ `AdBanner` model with Cloudinary support for images/videos
- ✅ Admin interface with preview, statistics, and multi-select locations
- ✅ REST API endpoints for fetching and tracking banners
- ✅ Location conflict validation (prevents duplicate locations)
- ✅ Media validation (image OR video, not both)
- ✅ Click and impression tracking

### Database
- ✅ Migrations created and applied
- ✅ `advertisements_adbanner` table ready to use

### API Endpoints
All endpoints are under `/api/advertisements/`

## How to Use

### 1. Access Admin Panel

Go to: `http://localhost:8000/admin/advertisements/adbanner/`

### 2. Add a Banner

1. Click "Add Ad Banner"
2. Enter a title (e.g., "Home Page Banner")
3. Set "Is active" checkbox
4. Upload EITHER:
   - An image (JPG, PNG, GIF), OR
   - A video (MP4, WebM)
5. Select size from dropdown:
   - **Small**: For sidebars (120px)
   - **Medium**: Between sections (150px)
   - **Large**: Major sections (200px)
   - **Card**: Grid layouts (250px)
   - **Row**: Inside lists (100px)
6. Check location checkboxes (you can select multiple)
7. Optional: Add link URL and alt text
8. Click Save

### 3. Important Rules

⚠️ **You CANNOT:**
- Upload both image AND video (choose one)
- Activate two banners with the same location
- Save without uploading image or video

✅ **You CAN:**
- Select multiple locations for one banner
- Deactivate a banner to free up its locations
- Change locations by deactivating conflicting banners first

### 4. View Statistics

In the admin list view, you'll see:
- Media preview
- Locations assigned
- Impressions (views)
- Clicks
- CTR (Click-Through Rate) in color:
  - 🟢 Green: > 5%
  - 🟡 Yellow: 2-5%
  - ⚪ Gray: < 2%

## API Usage

### Fetch Banners for a Location

```http
GET /api/advertisements/banners/?location=home_between_sections
```

Response:
```json
[
  {
    "id": 1,
    "media_type": "image",
    "media_url": "https://cloudinary.../banner.jpg",
    "link_url": "https://example.com",
    "alt_text": "Special Offer",
    "size": "large"
  }
]
```

### Track Impression (when banner is displayed)

```http
POST /api/advertisements/banners/1/track_impression/
```

### Track Click (when banner is clicked)

```http
POST /api/advertisements/banners/1/track_click/
```

## Available Locations

| Location Key | Description |
|-------------|-------------|
| `home_between_sections` | Home: Between Categories and Topics |
| `home_categories_grid` | Home: Inside Categories Grid |
| `home_topics_list` | Home: Inside Topics List |
| `sidebar_main` | Sidebar: Between Popular Topics and Top Members |
| `category_header` | Category Page: Between Header and Tabs |
| `category_topics_list` | Category Page: Inside Topics List |
| `category_sidebar` | Category Page: Sidebar (Rules/Tags) |
| `topic_before_replies` | Topic Page: Before Replies Section |
| `topic_sidebar` | Topic Page: Sidebar After Thread Info |

## Next Steps - Frontend Integration

The current `AdBanner` component shows placeholder content. To integrate real banners:

1. **Update AdBanner Component** to:
   - Accept a `location` prop
   - Fetch banner from API on mount
   - Display image or video based on `media_type`
   - Handle click tracking
   - Handle impression tracking

2. **Example Integration**:

```jsx
import React, { useState, useEffect } from 'react';

function AdBanner({ location, size = 'medium' }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    // Fetch banner for this location
    fetch(`/api/advertisements/banners/?location=${location}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setBanner(data[0]);
          // Track impression
          fetch(`/api/advertisements/banners/${data[0].id}/track_impression/`, {
            method: 'POST'
          });
        }
      });
  }, [location]);

  if (!banner) return null;

  const handleClick = () => {
    // Track click
    fetch(`/api/advertisements/banners/${banner.id}/track_click/`, {
      method: 'POST'
    });
    
    if (banner.link_url) {
      window.open(banner.link_url, '_blank');
    }
  };

  return (
    <div className={`ad-banner ad-banner-${banner.size}`} onClick={handleClick}>
      {banner.media_type === 'image' ? (
        <img src={banner.media_url} alt={banner.alt_text} />
      ) : (
        <video src={banner.media_url} autoPlay loop muted />
      )}
    </div>
  );
}
```

3. **Update Component Usage**:

```jsx
// Before:
<AdBanner size="large" />

// After:
<AdBanner location="home_between_sections" size="large" />
```

## Testing

1. **Start Django Server**:
   ```bash
   python manage.py runserver
   ```

2. **Login to Admin**:
   - Go to `http://localhost:8000/admin/`
   - Login with superuser credentials

3. **Add Test Banner**:
   - Navigate to Ad Banners
   - Add a new banner with test image
   - Select a location
   - Mark as active
   - Save

4. **Test API**:
   ```bash
   curl http://localhost:8000/api/advertisements/banners/
   ```

## Troubleshooting

### "Module not found: advertisements"
- Make sure app is in `INSTALLED_APPS` in settings.py ✅ (Already added)

### "Cannot activate banner: Location already used"
- Another active banner is using that location
- Deactivate the other banner first, or choose a different location

### "Banner must have either image or video"
- Upload either an image OR a video before saving

### Images not displaying in admin
- Make sure Cloudinary credentials are configured in settings.py
- Check `CLOUDINARY_STORAGE` settings

## Database Schema

```sql
Table: advertisements_adbanner
- id (Primary Key)
- title (VARCHAR)
- is_active (BOOLEAN)
- image (VARCHAR - Cloudinary)
- video (VARCHAR - Cloudinary)
- link_url (VARCHAR)
- alt_text (VARCHAR)
- locations (JSON)
- size (VARCHAR)
- impressions (INTEGER)
- clicks (INTEGER)
- created_at (DATETIME)
- updated_at (DATETIME)
```

## Features Summary

✅ Multi-location support with conflict prevention
✅ Image and video support via Cloudinary
✅ Click and impression tracking
✅ Beautiful admin interface with previews
✅ RESTful API for frontend integration
✅ Size variants for different placements
✅ Click-through rate calculation
✅ Active/Inactive toggle
✅ Link URL support for redirects
✅ Accessibility with alt text

---

**Your advertisement system is ready to use! 🎉**

Start by logging into the admin panel and creating your first banner.
