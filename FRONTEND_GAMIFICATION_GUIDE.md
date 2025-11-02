# Frontend Gamification Implementation Guide

## Step-by-Step Integration

### 1. Install the Components

The following components have been created:
- `/frontend/src/components/XPNotification.js` - XP notification component
- `/frontend/src/components/BadgeUnlockModal.js` - Badge unlock modal component
- `/frontend/src/styles/XPNotification.css` - XP notification styles
- `/frontend/src/styles/BadgeUnlockModal.css` - Badge unlock modal styles

### 2. Update App.js

Add the notification systems to your main App component:

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useXPNotifications } from './components/XPNotification';
import { useBadgeUnlock } from './components/BadgeUnlockModal';

// Import your page components
import HomePage from './components/HomePage';
import CreateTopicPage from './components/CreateTopicPage';
import TopicDetailPage from './components/TopicDetailPage';
// ... other imports

function App() {
  const { showXPNotification, NotificationContainer } = useXPNotifications();
  const { showBadgeUnlockModal, BadgeUnlockModalComponent } = useBadgeUnlock();

  return (
    <AuthProvider>
      <Router>
        {/* Add notification containers */}
        <NotificationContainer />
        <BadgeUnlockModalComponent />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/create-topic" 
            element={
              <CreateTopicPage 
                showXPNotification={showXPNotification}
                showBadgeUnlockModal={showBadgeUnlockModal}
              />
            } 
          />
          <Route 
            path="/topic/:id" 
            element={
              <TopicDetailPage 
                showXPNotification={showXPNotification}
                showBadgeUnlockModal={showBadgeUnlockModal}
              />
            } 
          />
          {/* ... other routes */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 3. Update CreateTopicPage.js

Add gamification feedback to topic creation:

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreateTopicPage.css';

const CreateTopicPage = ({ showXPNotification, showBadgeUnlockModal }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    // ... other fields
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Create the topic
      const response = await api.post('/api/topics/', formData);

      // ✨ Show gamification feedback
      if (response.data.gamification) {
        const { xp_awarded, badges_unlocked } = response.data.gamification;

        // Show XP notification
        if (xp_awarded > 0) {
          showXPNotification({
            xp: xp_awarded,
            message: "Topic Created! 🎯"
          });
        }

        // Show badge unlock modal if any badges were unlocked
        if (badges_unlocked && badges_unlocked.length > 0) {
          setTimeout(() => {
            showBadgeUnlockModal(badges_unlocked);
          }, 500); // Small delay for better UX
        }
      }

      // Navigate to the created topic
      setTimeout(() => {
        navigate(`/topic/${response.data.id}`);
      }, 1000); // Give time for notifications to show

    } catch (error) {
      console.error('Error creating topic:', error);
      // ... error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-topic-page">
      <form onSubmit={handleSubmit}>
        {/* Your form fields */}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Topic'}
        </button>
      </form>
    </div>
  );
};

export default CreateTopicPage;
```

### 4. Update TopicDetailPage.js

Add gamification to replies, likes, and bookmarks:

```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './TopicDetailPage.css';

const TopicDetailPage = ({ showXPNotification, showBadgeUnlockModal }) => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/replies/', {
        topic: id,
        content: replyText
      });

      // ✨ Show gamification feedback for reply
      if (response.data.gamification) {
        const { xp_awarded, badges_unlocked } = response.data.gamification;

        if (xp_awarded > 0) {
          showXPNotification({
            xp: xp_awarded,
            message: "Reply Posted! 💬"
          });
        }

        if (badges_unlocked && badges_unlocked.length > 0) {
          setTimeout(() => {
            showBadgeUnlockModal(badges_unlocked);
          }, 500);
        }
      }

      // Add reply to list and clear form
      setReplies([...replies, response.data]);
      setReplyText('');

    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  // Handle like action
  const handleLike = async (replyId) => {
    try {
      const response = await api.post(`/api/replies/${replyId}/like/`);

      // ✨ Show gamification feedback for like
      if (response.data.gamification) {
        const { xp_awarded } = response.data.gamification;

        if (xp_awarded > 0) {
          showXPNotification({
            xp: xp_awarded,
            message: "Author earned XP! ❤️"
          });
        }
      }

      // Update reply likes in state
      setReplies(replies.map(reply => 
        reply.id === replyId 
          ? { ...reply, likes_count: response.data.likes_count, user_has_liked: response.data.user_has_liked }
          : reply
      ));

    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  // Handle bookmark action
  const handleBookmark = async () => {
    try {
      const response = await api.post(`/api/topics/${id}/bookmark/`);

      // ✨ Show gamification feedback for bookmark
      if (response.data.gamification) {
        const { xp_awarded, badges_unlocked } = response.data.gamification;

        if (xp_awarded > 0) {
          showXPNotification({
            xp: xp_awarded,
            message: "Topic Bookmarked! 🔖"
          });
        }

        if (badges_unlocked && badges_unlocked.length > 0) {
          setTimeout(() => {
            showBadgeUnlockModal(badges_unlocked);
          }, 500);
        }
      }

      // Update bookmark status
      setTopic({
        ...topic,
        user_has_bookmarked: response.data.user_has_bookmarked
      });

    } catch (error) {
      console.error('Error bookmarking topic:', error);
    }
  };

  return (
    <div className="topic-detail-page">
      {/* Topic content */}
      <div className="topic-actions">
        <button onClick={handleBookmark}>
          {topic?.user_has_bookmarked ? 'Unbookmark' : 'Bookmark'}
        </button>
      </div>

      {/* Replies section */}
      <div className="replies">
        {replies.map(reply => (
          <div key={reply.id} className="reply">
            <div className="reply-content">{reply.content}</div>
            <button onClick={() => handleLike(reply.id)}>
              {reply.user_has_liked ? 'Unlike' : 'Like'} ({reply.likes_count})
            </button>
          </div>
        ))}
      </div>

      {/* Reply form */}
      <form onSubmit={handleReplySubmit}>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write a reply..."
        />
        <button type="submit">Post Reply</button>
      </form>
    </div>
  );
};

export default TopicDetailPage;
```

### 5. Update AuthPage.js

Add gamification to login (daily streak):

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AuthPage.css';

const AuthPage = ({ showXPNotification, showBadgeUnlockModal }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/auth/login/', credentials);

      // Save auth tokens
      login(response.data.tokens, response.data.user);

      // ✨ Show gamification feedback for login (daily streak)
      if (response.data.gamification) {
        const { xp_awarded, badges_unlocked } = response.data.gamification;

        if (xp_awarded > 0) {
          showXPNotification({
            xp: xp_awarded,
            message: "Daily Streak! 🔥"
          });
        }

        if (badges_unlocked && badges_unlocked.length > 0) {
          setTimeout(() => {
            showBadgeUnlockModal(badges_unlocked);
          }, 1000); // Longer delay for login flow
        }
      }

      // Navigate to home
      navigate('/');

    } catch (error) {
      console.error('Login error:', error);
      // ... error handling
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleLogin}>
        {/* Login form fields */}
      </form>
    </div>
  );
};

export default AuthPage;
```

### 6. Alternative: Context-Based Approach

If you prefer using React Context instead of prop drilling, create a gamification context:

```jsx
// context/GamificationContext.js
import React, { createContext, useContext } from 'react';
import { useXPNotifications } from '../components/XPNotification';
import { useBadgeUnlock } from '../components/BadgeUnlockModal';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { showXPNotification, NotificationContainer } = useXPNotifications();
  const { showBadgeUnlockModal, BadgeUnlockModalComponent } = useBadgeUnlock();

  // Helper function to handle gamification response
  const handleGamificationResponse = (gamificationData, actionMessage) => {
    if (!gamificationData) return;

    const { xp_awarded, badges_unlocked } = gamificationData;

    if (xp_awarded > 0) {
      showXPNotification({
        xp: xp_awarded,
        message: actionMessage
      });
    }

    if (badges_unlocked && badges_unlocked.length > 0) {
      setTimeout(() => {
        showBadgeUnlockModal(badges_unlocked);
      }, 500);
    }
  };

  return (
    <GamificationContext.Provider value={{ handleGamificationResponse }}>
      <NotificationContainer />
      <BadgeUnlockModalComponent />
      {children}
    </GamificationContext.Provider>
  );
};
```

Then in App.js:

```jsx
import { GamificationProvider } from './context/GamificationContext';

function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <Router>
          <Routes>
            {/* Your routes - no need to pass props! */}
          </Routes>
        </Router>
      </GamificationProvider>
    </AuthProvider>
  );
}
```

And use it in components:

```jsx
import { useGamification } from '../context/GamificationContext';

const CreateTopicPage = () => {
  const { handleGamificationResponse } = useGamification();

  const handleSubmit = async (e) => {
    const response = await api.post('/api/topics/', formData);
    
    // ✨ Simple one-liner
    handleGamificationResponse(response.data.gamification, "Topic Created! 🎯");
  };
};
```

## Testing

### Test Each Action:
1. ✅ Create a topic - Should show "+10 XP - Topic Created!"
2. ✅ Create a reply - Should show "+5 XP - Reply Posted!"
3. ✅ Like a reply - Should show "+2 XP - Author earned XP!"
4. ✅ Bookmark a topic - Should show "+1 XP - Topic Bookmarked!"
5. ✅ Login (once per day) - Should show "+5 XP - Daily Streak!"

### Test Badge Unlocks:
1. Create your first topic → Should unlock "First Post" badge
2. Get 10 likes → Should unlock "10 Likes Received" badge
3. Login 3 days in a row → Should unlock "3 Days Active" badge

## Customization

### Change XP Colors
Edit `/frontend/src/styles/XPNotification.css`:
```css
.xp-notification {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### Change Animation Duration
Edit `/frontend/src/components/XPNotification.js`:
```jsx
setTimeout(() => {
  setIsVisible(false);
  setTimeout(() => onClose && onClose(), 300);
}, 3000); // Change 3000 to your desired duration in ms
```

### Add Sound Effects
```jsx
const playXPSound = () => {
  const audio = new Audio('/sounds/xp-gain.mp3');
  audio.play();
};

// Call in handleGamificationResponse
if (xp_awarded > 0) {
  playXPSound();
  showXPNotification(...);
}
```

## Troubleshooting

### Notifications Not Showing
1. Check browser console for errors
2. Verify CSS files are imported correctly
3. Check if API response contains gamification data
4. Verify z-index values don't conflict with other elements

### Badge Modal Not Closing
1. Check if onClick handlers are properly attached
2. Verify onClose callback is passed correctly
3. Check browser console for errors

### Multiple Notifications Overlap
1. Adjust top position calculation in XPNotification.js
2. Increase spacing between notifications (currently 80px)

## Next Steps

1. Add sound effects for XP gain and badge unlocks
2. Add haptic feedback for mobile devices
3. Add animation when XP bar fills up in UserProfilePage
4. Add progress indicators for badge completion
5. Add daily/weekly challenges for bonus XP
