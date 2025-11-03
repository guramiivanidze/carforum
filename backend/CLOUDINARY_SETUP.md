# Cloudinary Setup Guide

## Overview
Cloudinary has been configured as the default file storage for media uploads in your Django project.

## Configuration Steps

### 1. Get Cloudinary Credentials
1. Go to [Cloudinary](https://cloudinary.com) and sign up or log in
2. Navigate to your Dashboard
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### 2. Set Environment Variables

#### Option A: Using .env file (Recommended for development)
1. Install python-decouple or python-dotenv:
   ```bash
   pip install python-decouple
   ```

2. Create a `.env` file in the `backend` directory:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your actual Cloudinary credentials:
   ```
   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```

4. Update `settings.py` to use python-decouple (add at the top):
   ```python
   from decouple import config
   
   CLOUDINARY_STORAGE = {
       'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME'),
       'API_KEY': config('CLOUDINARY_API_KEY'),
       'API_SECRET': config('CLOUDINARY_API_SECRET'),
   }
   ```

#### Option B: System Environment Variables
Set environment variables in your system or terminal:

**macOS/Linux:**
```bash
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret
```

**Add to ~/.zshrc for persistence:**
```bash
echo 'export CLOUDINARY_CLOUD_NAME=your_cloud_name' >> ~/.zshrc
echo 'export CLOUDINARY_API_KEY=your_api_key' >> ~/.zshrc
echo 'export CLOUDINARY_API_SECRET=your_api_secret' >> ~/.zshrc
source ~/.zshrc
```

### 3. What Changed

#### Files Modified:
1. **requirements.txt** - Added cloudinary packages
2. **settings.py** - Added:
   - `cloudinary_storage` and `cloudinary` to `INSTALLED_APPS`
   - Cloudinary configuration with environment variables
   - Set `DEFAULT_FILE_STORAGE` to use Cloudinary

### 4. How It Works

All file uploads through Django models (like `ImageField` and `FileField`) will now automatically:
- Upload to Cloudinary instead of local storage
- Return Cloudinary URLs instead of local file paths
- Handle image transformations and optimizations

#### Models Affected:
- `UserProfile.user_image` (avatar uploads)
- `TopicImage` (topic image uploads)
- Any other ImageField/FileField in your models

### 5. Testing

1. Start your Django server:
   ```bash
   python manage.py runserver
   ```

2. Try uploading an image (e.g., user avatar or topic image)

3. Check your Cloudinary dashboard - the image should appear in your media library

4. The image URL in your API responses will be a Cloudinary URL like:
   ```
   https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/topic_images/filename.jpg
   ```

### 6. Migration Notes

#### Existing Local Files
Files already uploaded to `/media/` will remain local. New uploads will go to Cloudinary.

To migrate existing files to Cloudinary, you can:
1. Manually upload them via Cloudinary dashboard
2. Write a management command to upload existing files
3. Keep old files local and only use Cloudinary for new uploads

#### Development vs Production
- Development: Can use the same Cloudinary account or a separate one
- Production: Set environment variables in your hosting platform (Heroku, AWS, etc.)

### 7. Additional Features

#### Image Transformations
Cloudinary automatically optimizes images. You can also request specific transformations:

```python
from cloudinary.templatetags import cloudinary

# In your template or serializer
cloudinary_url = cloudinary.CloudinaryImage(image_public_id).build_url(
    width=300, 
    height=300, 
    crop='fill'
)
```

#### Advanced Configuration
Add to your `CLOUDINARY_STORAGE` dict in settings.py:
```python
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
    'SECURE': True,  # Use HTTPS
    'PREFIX': 'media/',  # Optional folder prefix
    'STATICFILES_MANIFEST_ROOT': BASE_DIR / 'manifest',  # For static files
}
```

### 8. Troubleshooting

#### Images not uploading to Cloudinary
- Check that environment variables are set correctly
- Verify Cloudinary credentials in your dashboard
- Check Django logs for error messages

#### Getting 401 Unauthorized errors
- Double-check your API Key and API Secret
- Ensure there are no extra spaces in your credentials

#### Images still saving locally
- Verify `DEFAULT_FILE_STORAGE` is set in settings.py
- Restart Django server after changing settings
- Check that `cloudinary_storage` is before `django.contrib.staticfiles` in `INSTALLED_APPS`

## Security Notes

⚠️ **Important:**
- Never commit `.env` file with real credentials to version control
- Add `.env` to your `.gitignore` file
- Use different Cloudinary accounts/folders for development and production
- Rotate API credentials periodically

## Resources

- [Cloudinary Django Documentation](https://cloudinary.com/documentation/django_integration)
- [Django File Storage Documentation](https://docs.djangoproject.com/en/5.2/topics/files/)
- [Cloudinary Dashboard](https://cloudinary.com/console)
