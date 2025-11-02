# Gamification API Testing Guide

## Testing Backend Endpoints

Use these curl commands or your API client (Postman, Insomnia) to test the gamification integration.

### Prerequisites

1. Start the backend server:
```bash
cd backend
python3 manage.py runserver
```

2. Create a test user and get auth token:
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Login (save the access token from response)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser",
    "password": "testpass123"
  }'
```

### Test 1: Create Topic (10 XP)

```bash
export TOKEN="your_access_token_here"

curl -X POST http://localhost:8000/api/topics/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Topic",
    "content": "This is a test topic",
    "category": 1
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "title": "Test Topic",
  "content": "This is a test topic",
  "gamification": {
    "xp_awarded": 10,
    "badges_unlocked": [
      {
        "id": 1,
        "name": "First Post",
        "description": "Create your first topic",
        "icon": "🎉",
        "xp_reward": 50
      }
    ]
  }
}
```

### Test 2: Create Reply (5 XP)

```bash
curl -X POST http://localhost:8000/api/replies/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": 1,
    "content": "This is a test reply"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "content": "This is a test reply",
  "gamification": {
    "xp_awarded": 5,
    "badges_unlocked": []
  }
}
```

### Test 3: Like a Reply (2 XP to author)

First, create a reply with another user, then like it:

```bash
curl -X POST http://localhost:8000/api/replies/1/like/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "status": "liked",
  "likes_count": 1,
  "user_has_liked": true,
  "gamification": {
    "xp_awarded": 2,
    "badges_unlocked": []
  }
}
```

### Test 4: Bookmark Topic (1 XP)

```bash
curl -X POST http://localhost:8000/api/topics/1/bookmark/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "status": "bookmarked",
  "user_has_bookmarked": true,
  "gamification": {
    "xp_awarded": 1,
    "badges_unlocked": []
  }
}
```

### Test 5: Daily Login (5 XP + Streak)

```bash
# Login again (only awards XP once per day)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser",
    "password": "testpass123"
  }'
```

**Expected Response (first login of the day):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "tokens": { ... },
  "gamification": {
    "xp_awarded": 5,
    "badges_unlocked": []
  }
}
```

**Expected Response (subsequent logins same day):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "tokens": { ... },
  "gamification": {
    "xp_awarded": 0,
    "badges_unlocked": []
  }
}
```

## Check User Progress

### Get User's Gamification Data

```bash
# Get user level and XP
curl http://localhost:8000/api/gamification/user-levels/me/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "id": 1,
  "user": 1,
  "current_xp": 23,
  "total_xp": 23,
  "level": 1,
  "level_progress": 23,
  "next_level_xp": 100
}
```

### Get User's Badges

```bash
curl http://localhost:8000/api/gamification/user-badges/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "badge": {
      "id": 1,
      "name": "First Post",
      "description": "Create your first topic",
      "icon": "🎉",
      "category": "contribution",
      "xp_reward": 50
    },
    "unlocked": true,
    "progress": 1,
    "unlocked_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "badge": {
      "id": 2,
      "name": "10 Posts",
      "description": "Create 10 topics",
      "icon": "📝",
      "category": "contribution",
      "xp_reward": 100
    },
    "unlocked": false,
    "progress": 1,
    "unlocked_at": null
  }
]
```

### Get User's Streak

```bash
curl http://localhost:8000/api/gamification/user-streaks/me/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "id": 1,
  "user": 1,
  "current_streak": 1,
  "longest_streak": 1,
  "last_activity": "2024-01-15T10:30:00Z"
}
```

## Python Script for Testing

Create a file `test_gamification.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000"

def register_user():
    """Register a test user"""
    response = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "fullName": "Test User",
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    })
    return response.json()

def login_user():
    """Login and get token"""
    response = requests.post(f"{BASE_URL}/api/auth/login/", json={
        "email": "testuser",
        "password": "testpass123"
    })
    data = response.json()
    print("✅ Login successful")
    print(f"   XP Awarded: {data.get('gamification', {}).get('xp_awarded', 0)}")
    return data['tokens']['access']

def create_topic(token):
    """Create a topic"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/topics/", 
        headers=headers,
        json={
            "title": "Test Topic",
            "content": "Test content",
            "category": 1
        }
    )
    data = response.json()
    print("\n✅ Topic created")
    print(f"   XP Awarded: {data.get('gamification', {}).get('xp_awarded', 0)}")
    badges = data.get('gamification', {}).get('badges_unlocked', [])
    if badges:
        print(f"   🎉 Badges Unlocked: {[b['name'] for b in badges]}")
    return data['id']

def create_reply(token, topic_id):
    """Create a reply"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/replies/",
        headers=headers,
        json={
            "topic": topic_id,
            "content": "Test reply"
        }
    )
    data = response.json()
    print("\n✅ Reply created")
    print(f"   XP Awarded: {data.get('gamification', {}).get('xp_awarded', 0)}")
    return data['id']

def like_reply(token, reply_id):
    """Like a reply"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/replies/{reply_id}/like/",
        headers=headers
    )
    data = response.json()
    print("\n✅ Reply liked")
    print(f"   XP Awarded (to author): {data.get('gamification', {}).get('xp_awarded', 0)}")

def bookmark_topic(token, topic_id):
    """Bookmark a topic"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/topics/{topic_id}/bookmark/",
        headers=headers
    )
    data = response.json()
    print("\n✅ Topic bookmarked")
    print(f"   XP Awarded: {data.get('gamification', {}).get('xp_awarded', 0)}")

def get_user_stats(token):
    """Get user gamification stats"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get level
    response = requests.get(f"{BASE_URL}/api/gamification/user-levels/me/",
        headers=headers
    )
    level_data = response.json()
    
    # Get badges
    response = requests.get(f"{BASE_URL}/api/gamification/user-badges/",
        headers=headers
    )
    badges_data = response.json()
    unlocked_badges = [b for b in badges_data if b['unlocked']]
    
    # Get streak
    response = requests.get(f"{BASE_URL}/api/gamification/user-streaks/me/",
        headers=headers
    )
    streak_data = response.json()
    
    print("\n" + "="*50)
    print("📊 USER STATS")
    print("="*50)
    print(f"Level: {level_data['level']}")
    print(f"Total XP: {level_data['total_xp']}")
    print(f"Current XP: {level_data['current_xp']}/{level_data['next_level_xp']}")
    print(f"Progress: {level_data['level_progress']}%")
    print(f"Badges Unlocked: {len(unlocked_badges)}/{len(badges_data)}")
    print(f"Current Streak: {streak_data['current_streak']} days")
    print(f"Longest Streak: {streak_data['longest_streak']} days")
    print("\n🎖️  Unlocked Badges:")
    for badge in unlocked_badges:
        print(f"   {badge['badge']['icon']} {badge['badge']['name']}")

def main():
    print("🚀 Starting Gamification Tests\n")
    
    try:
        # Register or login
        try:
            register_user()
            print("✅ User registered")
        except:
            pass
        
        # Login
        token = login_user()
        
        # Perform actions
        topic_id = create_topic(token)
        reply_id = create_reply(token, topic_id)
        bookmark_topic(token, topic_id)
        
        # Show final stats
        get_user_stats(token)
        
        print("\n✅ All tests completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
```

Run the test:
```bash
python3 test_gamification.py
```

## Expected Output

```
🚀 Starting Gamification Tests

✅ Login successful
   XP Awarded: 5

✅ Topic created
   XP Awarded: 10
   🎉 Badges Unlocked: ['First Post']

✅ Reply created
   XP Awarded: 5

✅ Topic bookmarked
   XP Awarded: 1

==================================================
📊 USER STATS
==================================================
Level: 1
Total XP: 71
Current XP: 71/100
Progress: 71%
Badges Unlocked: 1/19
Current Streak: 1 days
Longest Streak: 1 days

🎖️  Unlocked Badges:
   🎉 First Post

✅ All tests completed!
```

## Debugging

### No XP Awarded

1. Check if gamification service is being called:
```python
# In views.py
print(f"Gamification result: {gamification_result}")
```

2. Check database for UserLevel:
```bash
python3 manage.py shell
>>> from django.contrib.auth.models import User
>>> from gamification.models import UserLevel
>>> user = User.objects.first()
>>> level = UserLevel.objects.get(user=user)
>>> print(f"XP: {level.total_xp}, Level: {level.level}")
```

### Badges Not Unlocking

1. Check badge progress:
```bash
python3 manage.py shell
>>> from gamification.models import UserBadge
>>> badges = UserBadge.objects.filter(user=user)
>>> for b in badges:
...     print(f"{b.badge.name}: {b.progress}/{b.badge.target_value} - Unlocked: {b.unlocked}")
```

2. Check if populate_badges was run:
```bash
python3 manage.py shell
>>> from gamification.models import Badge
>>> print(Badge.objects.count())  # Should be 19
```

### Streak Not Updating

1. Check UserStreak model:
```bash
python3 manage.py shell
>>> from gamification.models import UserStreak
>>> streak = UserStreak.objects.get(user=user)
>>> print(f"Current: {streak.current_streak}, Last: {streak.last_activity}")
```

2. Test streak manually:
```python
from gamification.services import GamificationService
from django.contrib.auth.models import User

user = User.objects.first()
result = GamificationService.update_daily_streak(user)
print(result)
```
