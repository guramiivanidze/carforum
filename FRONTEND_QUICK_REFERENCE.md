# Quick Reference: Using the Improved Frontend

## 🎯 Common Tasks

### 1. Fetch Data in a Component

**OLD WAY ❌:**
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    const result = await getUserProfile(userId);
    setData(result);
    setLoading(false);
  };
  fetchData();
}, [userId]);
```

**NEW WAY ✅:**
```javascript
import { useFetch } from '../hooks/useDataFetch';

const { data, loading, error, refetch } = useFetch(
  () => getUserProfile(userId),
  [userId]
);
```

---

### 2. Load Data Only When Tab is Active

```javascript
import { useTabData } from '../hooks/useDataFetch';

const { data: replies, loading } = useTabData(
  () => getUserReplies(userId),
  activeTab,    // Current tab
  'replies',    // Target tab
  [userId]      // Dependencies
);
```

---

### 3. Search with Debouncing

```javascript
import { useDebouncedFetch } from '../hooks/useDataFetch';

const { data: results, loading } = useDebouncedFetch(
  (query) => searchTopics(query),
  searchQuery,
  500,  // Wait 500ms after typing stops
  3     // Minimum 3 characters
);
```

---

### 4. Manual Fetch (Lazy Loading)

```javascript
import { useLazyFetch } from '../hooks/useDataFetch';

const { data, loading, fetch: loadData } = useLazyFetch(
  () => getReportReasons()
);

// Later in onClick or other event:
const handleClick = async () => {
  const result = await loadData();
};
```

---

### 5. Infinite Scroll / Pagination

```javascript
import { usePagination } from '../hooks/useDataFetch';

const { data, loading, hasMore, loadMore } = usePagination(
  (page) => getTopics({ page }),
  { pageSize: 10 }
);

// In render:
{hasMore && <button onClick={loadMore}>Load More</button>}
```

---

## 🔧 Cache Management

### Check Cache Status

Open browser console and look for these logs:
```
✅ Cache HIT: categories
❌ Cache MISS: topics/123
🌐 Fetching: profiles/5
💾 Cached: profiles/5 (TTL: 180s)
```

### Manual Cache Invalidation

After creating/updating data, invalidate cache:

```javascript
import apiCache from '../services/apiCache';

// After creating a topic
await createTopic(topicData);
apiCache.invalidate('topics');

// After updating profile
await updateProfile(userId, data);
apiCache.invalidate(`profiles/${userId}`);

// Clear all cache
apiCache.clearAll();
```

### Common Invalidation Patterns

| Action | Invalidate |
|--------|-----------|
| Create Topic | `topics`, `categories` |
| Update Topic | `topics/${id}`, `topics` |
| Like Topic | `topics/${id}` |
| Create Reply | `topics/${topicId}` |
| Update Profile | `profiles/${userId}` |
| Follow User | `followers`, `following` |
| Bookmark Topic | `bookmarks` |

---

## 📚 API Functions Reference

### Authentication
```javascript
await register(userData)
await login(credentials)
await logout()
await getCurrentUser()
```

### Topics
```javascript
await getTopics({ page, page_size, ordering })
await getTopic(id)
await createTopic(topicData)
await updateTopic(id, topicData)
await likeTopic(id)
await bookmarkTopic(id)
```

### Categories
```javascript
await getCategories()
await getCategoryTopics(categoryId, { page, page_size })
```

### Profiles
```javascript
await getUserProfile(id)
await updateProfile(userId, data)
await uploadUserImage(userId, file)
await changePassword(userId, passwordData)
await getUserTopics(profileId)
await getUserReplies(profileId)
await getUserBookmarks(profileId)
```

### Replies
```javascript
await createReply(topicId, replyData)
await likeReply(replyId)
await deleteReply(replyId)
```

### Follow/Following
```javascript
await toggleFollow(userId)
await getFollowers(userId)
await getFollowing(userId)
await getFollowingTopics(userId)
```

### Gamification
```javascript
await getUserGamification(userId)
await getMyLevel()
await getLeaderboard()
await getAllBadges()
await getUserBadges(userId)
await getMyStreak()
await updateStreak()
```

### Tags & Search
```javascript
await getPopularTags()
await searchAll(query, filters)
```

### Reports
```javascript
await getReportReasons()
await createReport(reportData)
```

### Polls
```javascript
await votePoll(pollId, optionId)
```

---

## 🎨 Component Patterns

### Loading States
```javascript
const { data, loading, error } = useFetch(...);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
if (!data) return <div>No data</div>;

return <div>{data.title}</div>;
```

### Conditional Fetching
```javascript
const { data } = useFetch(
  () => getUserProfile(userId),
  [userId],
  { enabled: !!userId }  // Only fetch if userId exists
);
```

### Refetch on Demand
```javascript
const { data, refetch } = useFetch(...);

const handleRefresh = async () => {
  await refetch();  // Force fresh data
};
```

---

## 🐛 Debugging Tips

### 1. Check Cache Logs
Open Console → Look for cache-related messages with emojis

### 2. Check Network Tab
- First visit: Multiple requests
- Second visit: Fewer requests (cached)

### 3. Manually Inspect Cache
```javascript
// In browser console
import apiCache from './services/apiCache';
apiCache.getStats();
```

### 4. Force Fresh Data
```javascript
// Skip cache completely
const { data, refetch } = useFetch(...);
await refetch();  // Bypasses cache
```

---

## ⚡ Performance Tips

1. **Use caching** - API functions automatically cache GET requests
2. **Tab-based loading** - Use `useTabData` to load only when needed
3. **Debounce search** - Use `useDebouncedFetch` for search inputs
4. **Pagination** - Use `usePagination` for large lists
5. **Invalidate wisely** - Only invalidate what changed

---

## ✅ Best Practices

### DO ✅
- Use custom hooks instead of manual useEffect
- Let API functions handle caching automatically
- Invalidate cache after mutations
- Add JSDoc comments to new functions
- Use descriptive variable names

### DON'T ❌
- Don't bypass cache unless necessary
- Don't create duplicate fetch logic
- Don't forget to handle loading/error states
- Don't over-invalidate cache (slows down app)
- Don't fetch data that's not shown to user

---

## 📖 Further Reading

- `FRONTEND_REFACTORING.md` - Complete documentation
- `services/apiCache.js` - Cache implementation details
- `hooks/useDataFetch.js` - Custom hooks source code
- `services/api.js` - All API functions with JSDoc

---

**Quick Help:**
- Stuck? Check console for cache logs
- Errors? Look at network tab
- Questions? Read function comments in code
