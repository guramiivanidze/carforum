# Backend Updates for Enhanced Create Topic Feature

## Summary of Changes

The backend has been updated to support the new enhanced Create Topic features including **image uploads** and **polls**. Below are the detailed changes made to each file.

---

## 📁 New Models Added

### 1. **TopicImage Model** (`forum/models.py`)
Handles multiple image uploads for topics.

**Fields:**
- `topic` - ForeignKey to Topic (related_name='images')
- `image` - ImageField (uploads to 'topic_images/%Y/%m/%d/')
- `caption` - CharField (max 200, optional)
- `order` - IntegerField for ordering images
- `created_at` - Auto timestamp

**Features:**
- Automatic date-based folder organization
- Ordered display
- Cascade delete with topic

### 2. **Poll Model** (`forum/models.py`)
One poll per topic with multiple options.

**Fields:**
- `topic` - OneToOneField to Topic (related_name='poll')
- `question` - CharField (max 300)
- `created_at` - Auto timestamp

**Properties:**
- `total_votes` - Computed from all options

### 3. **PollOption Model** (`forum/models.py`)
Individual voting options for polls.

**Fields:**
- `poll` - ForeignKey to Poll (related_name='options')
- `text` - CharField (max 200)
- `order` - IntegerField for display order
- `created_at` - Auto timestamp

**Properties:**
- `votes_count` - Number of votes
- `percentage` - Calculated percentage of total votes

### 4. **PollVote Model** (`forum/models.py`)
Tracks user votes on poll options.

**Fields:**
- `poll_option` - ForeignKey to PollOption (related_name='votes')
- `user` - ForeignKey to User (related_name='poll_votes')
- `created_at` - Auto timestamp

**Constraints:**
- Unique together (poll_option, user) - One vote per user per poll

---

## 🔄 Updated Serializers

### 1. **TopicImageSerializer** (`forum/serializers.py`)
```python
fields = ['id', 'image', 'image_url', 'caption', 'order', 'created_at']
```
- Includes `image_url` method field for absolute URLs
- Handles request context for building full URLs

### 2. **PollOptionSerializer** (`forum/serializers.py`)
```python
fields = ['id', 'text', 'order', 'votes_count', 'percentage', 'user_has_voted']
```
- Shows vote statistics
- Indicates if current user voted for this option

### 3. **PollSerializer** (`forum/serializers.py`)
```python
fields = ['id', 'question', 'options', 'total_votes', 'user_vote', 'created_at']
```
- Nested PollOptionSerializer for options
- `user_vote` shows which option user selected
- `total_votes` computed property

### 4. **PollVoteSerializer** (`forum/serializers.py`)
```python
fields = ['id', 'poll_option', 'user', 'created_at']
```
- Simple serializer for vote recording

### 5. **Updated TopicSerializer**
Added fields:
- `images` - TopicImageSerializer(many=True)
- `poll` - PollSerializer()

### 6. **Updated TopicDetailSerializer**
Added fields:
- `images` - TopicImageSerializer(many=True)
- `poll` - PollSerializer()

---

## 🎛️ Admin Interface Updates

### New Admin Classes (`forum/admin.py`)

**TopicImageAdmin:**
- List display: topic, caption, order, created_at
- Search by topic title, caption
- Read-only: created_at

**PollAdmin:**
- List display: question, topic, total_votes, created_at
- Inline editing of poll options
- Search by question, topic title

**PollOptionAdmin:**
- List display: text, poll, votes_count, percentage, order
- Filter by poll
- Read-only: votes_count, percentage

**PollVoteAdmin:**
- List display: user, poll_option, created_at
- Search by username, option text
- Tracks all votes

**PollOptionInline:**
- Tabular inline for creating options with polls
- Shows text and order fields
- 2 extra empty forms by default

---

## ⚙️ Configuration Changes

### 1. **settings.py** (`carforum_backend/settings.py`)
Added media file configuration:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### 2. **urls.py** (`carforum_backend/urls.py`)
Added media file serving in development:
```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 3. **requirements.txt**
Added Pillow for image handling:
```
Pillow==11.0.0
```

---

## 🗄️ Database Migration

**Required Steps:**
1. Install Pillow: `pip install Pillow==11.0.0`
2. Create migrations: `python manage.py makemigrations`
3. Apply migrations: `python manage.py migrate`

**New Tables:**
- `forum_topicimage` - Stores topic images
- `forum_poll` - Stores polls
- `forum_polloption` - Stores poll options
- `forum_pollvote` - Stores user votes

---

## 📤 API Response Examples

### Topic with Images and Poll

```json
{
  "id": 1,
  "title": "What's the best car for daily driving?",
  "author": {
    "id": 1,
    "username": "john_doe",
    "avatar": "🚗",
    "points": 150
  },
  "category": {
    "id": 2,
    "icon": "🚙",
    "title": "General Discussion"
  },
  "content": "I'm looking for recommendations...",
  "images": [
    {
      "id": 1,
      "image": "/media/topic_images/2024/11/01/car_photo.jpg",
      "image_url": "http://localhost:8000/media/topic_images/2024/11/01/car_photo.jpg",
      "caption": "My current car",
      "order": 0
    }
  ],
  "poll": {
    "id": 1,
    "question": "Which type do you prefer?",
    "options": [
      {
        "id": 1,
        "text": "Sedan",
        "order": 0,
        "votes_count": 15,
        "percentage": 45.5,
        "user_has_voted": false
      },
      {
        "id": 2,
        "text": "SUV",
        "order": 1,
        "votes_count": 12,
        "percentage": 36.4,
        "user_has_voted": true
      },
      {
        "id": 3,
        "text": "Hatchback",
        "order": 2,
        "votes_count": 6,
        "percentage": 18.1,
        "user_has_voted": false
      }
    ],
    "total_votes": 33,
    "user_vote": 2
  },
  "replies_count": 8,
  "views": 245,
  "created_at": "2024-11-01T10:30:00Z"
}
```

---

## 🔜 Next Steps

### Frontend Integration
The frontend is already prepared to handle:
- ✅ Image preview and upload
- ✅ Poll creation with options
- ✅ Form validation

### Backend API Endpoints Needed
You may want to add these endpoints:

1. **Upload Image** (if not using form data with topic creation)
   ```
   POST /api/topics/<id>/images/
   ```

2. **Vote on Poll**
   ```
   POST /api/polls/<poll_id>/vote/
   Body: { "option_id": 2 }
   ```

3. **Get Poll Results**
   ```
   GET /api/polls/<poll_id>/results/
   ```

### Views to Update (`forum/views.py`)
The `createTopic` view needs to handle:
- Image file uploads from `request.FILES`
- Poll data from `request.data.get('poll')`
- Creating related objects after topic creation

Example structure:
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_topic(request):
    # Create topic
    topic = Topic.objects.create(...)
    
    # Handle images
    if request.FILES:
        for image in request.FILES.getlist('images'):
            TopicImage.objects.create(topic=topic, image=image)
    
    # Handle poll
    if 'poll' in request.data:
        poll_data = request.data['poll']
        poll = Poll.objects.create(topic=topic, question=poll_data['question'])
        for idx, option in enumerate(poll_data['options']):
            PollOption.objects.create(poll=poll, text=option, order=idx)
    
    return Response(TopicDetailSerializer(topic).data)
```

---

## ✅ Testing Checklist

- [ ] Install Pillow package
- [ ] Run migrations successfully
- [ ] Create topic with images via admin
- [ ] Create topic with poll via admin
- [ ] Vote on poll via admin
- [ ] View topic with images in API response
- [ ] View poll results in API response
- [ ] Test image URL generation
- [ ] Test poll percentage calculation
- [ ] Test vote uniqueness constraint
- [ ] Test cascade deletes

---

## 🛠️ Maintenance Notes

**Media Files:**
- Images stored in `media/topic_images/%Y/%m/%d/`
- Organize by date automatically
- Remember to configure media storage for production (S3, CloudFlare, etc.)

**Poll Constraints:**
- One poll per topic (OneToOne relationship)
- One vote per user per poll (unique_together constraint)
- Percentage calculated dynamically

**Performance:**
- Consider adding indexes on `topic_id` for TopicImage
- Consider caching poll results for popular topics
- Image uploads should have size/type validation

---

**Status**: ✅ Backend models and serializers ready
**Next**: Update views to handle image uploads and poll creation
**Version**: 1.0
**Date**: November 1, 2024
