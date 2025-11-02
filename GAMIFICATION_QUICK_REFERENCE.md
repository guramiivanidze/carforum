# 🎮 Gamification Quick Reference

## XP Rewards

| Action | XP | Trigger Location |
|--------|----|--------------------|
| 🎯 Create Topic | **10 XP** | POST `/api/topics/` |
| 💬 Create Reply | **5 XP** | POST `/api/replies/` |
| ❤️ Receive Like | **2 XP** | POST `/api/replies/{id}/like/` |
| 🔖 Create Bookmark | **1 XP** | POST `/api/topics/{id}/bookmark/` |
| 📅 Daily Login | **5 XP** | POST `/api/auth/login/` (once per day) |

## Badges (19 Total)

### 🏆 Contribution (5 badges)
- 🎉 **First Post** - Create your first topic (1 topic) → **50 XP**
- 📝 **10 Posts** - Create 10 topics (10 topics) → **100 XP**
- ✍️ **50 Posts** - Create 50 topics (50 topics) → **200 XP**
- 💬 **100 Replies** - Post 100 replies (100 replies) → **150 XP**
- 🏆 **Expert Mechanic** - Create 100 topics or replies combined (100 combined) → **300 XP**

### 👥 Social (3 badges)
- ❤️ **10 Likes Received** - Get 10 likes (10 likes) → **50 XP**
- 🌟 **50 Likes Received** - Get 50 likes (50 likes) → **150 XP**
- ⭐ **100 Likes Received** - Get 100 likes (100 likes) → **300 XP**

### 🤝 Helpful (1 badge)
- 🔖 **Bookworm** - Bookmark 50 topics (50 bookmarks) → **100 XP**

### 🔥 Streaks (4 badges)
- 🔥 **3 Days Active** - Login 3 consecutive days (3 day streak) → **50 XP**
- 🚀 **7 Days Active** - Login 7 consecutive days (7 day streak) → **100 XP**
- ⚡ **30 Days Active** - Login 30 consecutive days (30 day streak) → **200 XP**
- 💎 **100 Days Active** - Login 100 consecutive days (100 day streak) → **500 XP**

### ⭐ Special (4 badges)
- 🌟 **Rising Star** - Reach level 5 (level 5) → **100 XP**
- 💪 **Power User** - Reach level 10 (level 10) → **200 XP**
- 👑 **Forum Legend** - Reach level 25 (level 25) → **500 XP**
- 🏅 **Ultimate Master** - Reach level 50 (level 50) → **1000 XP**

## Level System

| Level | Required XP | Total XP |
|-------|-------------|----------|
| 1 | 0 | 0 |
| 2 | 100 | 100 |
| 3 | 150 | 250 |
| 4 | 200 | 450 |
| 5 | 250 | 700 |
| 10 | 500 | 2950 |
| 25 | 1,250 | 21,200 |
| 50 | 2,500 | 67,950 |

*Formula: level_xp = 50 * level + (level - 1) * 50*

## API Endpoints

### Get User Stats
```bash
GET /api/gamification/user-levels/me/
Authorization: Bearer {token}
```

### Get User Badges
```bash
GET /api/gamification/user-badges/
Authorization: Bearer {token}
```

### Get Unlocked Badges Only
```bash
GET /api/gamification/user-badges/unlocked/
Authorization: Bearer {token}
```

### Get User Streak
```bash
GET /api/gamification/user-streaks/me/
Authorization: Bearer {token}
```

### Get All Available Badges
```bash
GET /api/gamification/badges/
```

## Frontend Integration

### 1. Import Hooks
```jsx
import { useXPNotifications } from './components/XPNotification';
import { useBadgeUnlock } from './components/BadgeUnlockModal';
```

### 2. Use in Component
```jsx
const { showXPNotification, NotificationContainer } = useXPNotifications();
const { showBadgeUnlockModal, BadgeUnlockModalComponent } = useBadgeUnlock();
```

### 3. Handle API Response
```jsx
const response = await api.post('/api/topics/', data);

if (response.data.gamification?.xp_awarded) {
  showXPNotification({
    xp: response.data.gamification.xp_awarded,
    message: "Topic Created! 🎯"
  });
}

if (response.data.gamification?.badges_unlocked?.length > 0) {
  showBadgeUnlockModal(response.data.gamification.badges_unlocked);
}
```

## Testing Commands

### Run Backend Tests
```bash
cd backend
python3 manage.py test gamification
```

### Check Django Config
```bash
python3 manage.py check
```

### Create Test Data
```bash
python3 manage.py shell
>>> from django.contrib.auth.models import User
>>> from gamification.services import GamificationService
>>> user = User.objects.first()
>>> GamificationService.track_topic_created(user)
```

### View User Stats
```bash
python3 manage.py shell
>>> from gamification.models import UserLevel, UserBadge
>>> user = User.objects.get(username='testuser')
>>> level = UserLevel.objects.get(user=user)
>>> print(f"Level: {level.level}, XP: {level.total_xp}")
>>> badges = UserBadge.objects.filter(user=user, unlocked=True)
>>> for b in badges: print(b.badge.name)
```

## Files Structure

### Backend
```
backend/
├── gamification/
│   ├── models.py           # UserLevel, Badge, UserBadge, UserStreak
│   ├── serializers.py      # 5 serializers
│   ├── views.py            # 4 viewsets + 1 function view
│   ├── urls.py             # API routes
│   ├── admin.py            # Admin interfaces
│   ├── services.py         # GamificationService (core logic)
│   └── management/
│       └── commands/
│           └── populate_badges.py  # Creates 19 badges
└── forum/
    ├── views.py            # Topic & Reply integration
    └── auth_views.py       # Login integration
```

### Frontend
```
frontend/src/
├── components/
│   ├── XPNotification.js
│   └── BadgeUnlockModal.js
└── styles/
    ├── XPNotification.css
    └── BadgeUnlockModal.css
```

### Documentation
```
├── GAMIFICATION_COMPLETE.md         # Full overview
├── GAMIFICATION_INTEGRATION.md      # Backend details
├── FRONTEND_GAMIFICATION_GUIDE.md   # Frontend guide
├── GAMIFICATION_TESTING.md          # Testing guide
└── GAMIFICATION_QUICK_REFERENCE.md  # This file
```

## Common Issues

### Issue: No XP awarded
**Solution**: Check if GamificationService is being called in views

### Issue: Badges not unlocking
**Solution**: Run `python3 manage.py populate_badges` if badges don't exist

### Issue: Streak not updating
**Solution**: Streak updates only once per day, check UserStreak.last_activity

### Issue: Frontend notifications not showing
**Solution**: Verify CSS is imported and check browser console for errors

## Next Steps

1. ✅ Backend complete - All XP and badges working
2. 🟡 Frontend ready - Components created, needs integration
3. ⏳ Add to pages - Follow FRONTEND_GAMIFICATION_GUIDE.md
4. ⏳ Test - Use GAMIFICATION_TESTING.md
5. ⏳ Customize - Adjust colors, animations, sounds

## Support

For detailed information:
- Backend details → `GAMIFICATION_INTEGRATION.md`
- Frontend guide → `FRONTEND_GAMIFICATION_GUIDE.md`
- Testing → `GAMIFICATION_TESTING.md`
- Overview → `GAMIFICATION_COMPLETE.md`
