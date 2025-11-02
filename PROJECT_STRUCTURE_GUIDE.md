# 🚗 Car Forum - Complete Project Structure Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Backend Structure](#backend-structure)
5. [Frontend Structure](#frontend-structure)
6. [Data Flow](#data-flow)
7. [API Endpoints](#api-endpoints)
8. [Authentication Flow](#authentication-flow)
9. [Key Features](#key-features)

---

## 🎯 Project Overview

**Car Forum** is a full-stack web application for community discussions, similar to Reddit or traditional forums. Users can:
- Browse categories and topics
- Create topics and post replies
- Like replies and bookmark topics
- Report inappropriate content
- Search for topics
- View user profiles with stats

---

## 💻 Technology Stack

### Backend
- **Framework**: Django 5.2.7
- **API**: Django REST Framework 3.16.1
- **Authentication**: JWT (Simple JWT)
- **Database**: SQLite (development)
- **CORS**: django-cors-headers

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Styling**: CSS (custom)

---

## 🏗️ Architecture

```
┌─────────────────┐         HTTP/REST API        ┌──────────────────┐
│                 │◄──────────────────────────────►│                  │
│  React Frontend │         Port 3000→8000        │  Django Backend  │
│   (Port 3000)   │                               │   (Port 8000)    │
│                 │                               │                  │
└─────────────────┘                               └──────────────────┘
        │                                                   │
        │                                                   │
        ▼                                                   ▼
 ┌──────────────┐                                 ┌─────────────────┐
 │ Local Storage│                                 │  SQLite Database│
 │  (JWT tokens)│                                 │   (db.sqlite3)  │
 └──────────────┘                                 └─────────────────┘
```

**Communication Flow:**
1. Frontend sends HTTP requests to `http://localhost:8000/api/`
2. Backend processes requests using Django REST Framework ViewSets
3. Data is stored/retrieved from SQLite database
4. JSON responses are sent back to frontend
5. Frontend updates UI based on response

---

## 🔧 Backend Structure

### Directory Layout
```
backend/
├── carforum_backend/          # Project configuration
│   ├── __init__.py
│   ├── settings.py            # Django settings (DB, apps, middleware)
│   ├── urls.py                # Main URL router
│   ├── wsgi.py                # WSGI entry point
│   └── asgi.py                # ASGI entry point
├── forum/                     # Main application
│   ├── __init__.py
│   ├── models.py              # Database models (7 models)
│   ├── serializers.py         # DRF serializers (JSON conversion)
│   ├── views.py               # API ViewSets (6 viewsets)
│   ├── urls.py                # Forum API routes
│   ├── auth_views.py          # Authentication endpoints
│   ├── auth_urls.py           # Auth routes
│   ├── admin.py               # Django admin config
│   └── management/
│       └── commands/
│           └── populate_data.py  # Sample data generator
├── db.sqlite3                 # SQLite database file
├── manage.py                  # Django management script
└── requirements.txt           # Python dependencies
```

### Database Models (7 Models)

#### 1. **Category** (`forum/models.py`)
```python
- icon (CharField)           # Emoji icon (e.g., 💬)
- title (CharField)          # Category name
- description (TextField)    # Category description
- created_at (DateTimeField)
- topics_count (property)    # Computed count of topics
```

#### 2. **Topic** (`forum/models.py`)
```python
- title (CharField)          # Topic title
- author (ForeignKey→User)   # Topic creator
- category (ForeignKey→Category)
- content (TextField)        # Topic content
- created_at (DateTimeField)
- updated_at (DateTimeField)
- views (IntegerField)       # View count
- replies_count (property)   # Computed count of replies
```

#### 3. **Reply** (`forum/models.py`)
```python
- topic (ForeignKey→Topic)
- author (ForeignKey→User)
- content (TextField)
- likes (ManyToManyField→User)  # Users who liked
- is_hidden (BooleanField)      # For moderation
- created_at (DateTimeField)
- updated_at (DateTimeField)
- likes_count (property)
```

#### 4. **UserProfile** (`forum/models.py`)
```python
- user (OneToOneField→User)
- avatar (CharField)         # Emoji avatar
- points (IntegerField)      # User reputation
- bio (TextField)
```

#### 5. **Bookmark** (`forum/models.py`)
```python
- user (ForeignKey→User)
- topic (ForeignKey→Topic)
- created_at (DateTimeField)
```

#### 6. **ReportReason** (`forum/models.py`)
```python
- title (CharField)          # Reason name
- description (TextField)
- is_active (BooleanField)
- order (IntegerField)       # Display order
```

#### 7. **Report** (`forum/models.py`)
```python
- reply (ForeignKey→Reply)
- reporter (ForeignKey→User)
- reason (ForeignKey→ReportReason)
- additional_info (TextField)
- status (CharField)         # pending/reviewed/resolved/dismissed
- created_at (DateTimeField)
- reviewed_at (DateTimeField)
- reviewed_by (ForeignKey→User)
```

### API ViewSets (6 ViewSets)

#### 1. **CategoryViewSet** (`forum/views.py`)
- **Purpose**: Manage forum categories
- **Endpoints**: Standard CRUD operations
- **Custom Actions**: None

#### 2. **TopicViewSet** (`forum/views.py`)
- **Purpose**: Manage forum topics
- **Endpoints**: Standard CRUD + custom actions
- **Custom Actions**:
  - `increment_views(pk)` - Increment topic view count
  - `replies(pk)` - Create reply for topic
  - `bookmark(pk)` - Bookmark/unbookmark topic

#### 3. **ReplyViewSet** (`forum/views.py`)
- **Purpose**: Manage replies
- **Endpoints**: Standard CRUD + custom actions
- **Custom Actions**:
  - `like(pk)` - Like/unlike a reply

#### 4. **UserProfileViewSet** (`forum/views.py`)
- **Purpose**: User profiles (read-only)
- **Endpoints**: List, retrieve + custom actions
- **Custom Actions**:
  - `top_members()` - Get top 10 users by points
  - `replies(pk)` - Get user's replies
  - `topics(pk)` - Get user's topics
  - `bookmarks(pk)` - Get user's bookmarks

#### 5. **ReportReasonViewSet** (`forum/views.py`)
- **Purpose**: Available report reasons (read-only)
- **Endpoints**: List, retrieve

#### 6. **ReportViewSet** (`forum/views.py`)
- **Purpose**: Content reports (authenticated only)
- **Endpoints**: Standard CRUD
- **Special**: Users can only see their own reports

---

## 🎨 Frontend Structure

### Directory Layout
```
frontend/src/
├── components/               # React components
│   ├── AuthPage.js          # Login/Register page
│   ├── CategoriesSection.js # Category grid
│   ├── CategoryPage.js      # Single category view
│   ├── CreateTopicPage.js   # Create/Edit topic form
│   ├── Footer.js            # Footer component
│   ├── Header.js            # Header with nav + user menu
│   ├── HeroSection.js       # Hero banner
│   ├── HomePage.js          # Landing page
│   ├── ReportModal.js       # Report content modal
│   ├── SearchPage.js        # Search interface
│   ├── Sidebar.js           # Sidebar with stats
│   ├── TopicDetailPage.js   # Single topic view
│   ├── TopicsSection.js     # Topics list
│   └── UserProfilePage.js   # User profile page
├── context/
│   └── AuthContext.js       # Global auth state
├── services/
│   └── api.js               # Axios API client
├── styles/                  # CSS files
│   ├── AuthPage.css
│   ├── CategoryPage.css
│   ├── CreateTopicPage.css
│   ├── ReportModal.css
│   ├── SearchPage.css
│   ├── TopicDetailPage.css
│   └── UserProfilePage.css
├── App.js                   # Main app component + routes
├── App.css                  # Global styles
└── index.js                 # React entry point
```

### Key Components

#### 1. **AuthContext** (`context/AuthContext.js`)
**Purpose**: Global authentication state management

**State:**
```javascript
{
  user: { id, username, email },
  profile: { id, avatar, points, bio },
  isAuthenticated: boolean,
  loading: boolean
}
```

**Methods:**
- `login(userData, profileData, tokens)` - Store auth data
- `logout()` - Clear auth data

#### 2. **API Service** (`services/api.js`)
**Purpose**: Centralized HTTP client with interceptors

**Features:**
- Automatic JWT token injection
- Token refresh on 401 errors
- Axios interceptors for auth

**Methods:**
```javascript
// Authentication
register(userData)
login(credentials)
logout()
getCurrentUser()

// Forum
getCategories()
getTopics()
getTopic(id)
createTopic(topicData)
updateTopic(topicId, topicData)
createReply(topicId, replyData)

// User
getUserProfile(id)
getUserReplies(profileId)
getUserTopics(profileId)
getUserBookmarks(profileId)
getTopMembers()

// Interactions
likeReply(replyId)
bookmarkTopic(topicId)

// Reports
getReportReasons()
createReport(reportData)
```

#### 3. **App Routes** (`App.js`)
```javascript
/                   → HomePage
/search            → SearchPage
/category/:id      → CategoryPage
/topic/:id         → TopicDetailPage
/create-topic      → CreateTopicPage
/edit-topic/:id    → CreateTopicPage (edit mode)
/profile/:id       → UserProfilePage
/login             → AuthPage (login mode)
/register          → AuthPage (register mode)
```

---

## 🔄 Data Flow

### Example: Creating a Topic

```
1. User fills form in CreateTopicPage
      ↓
2. Form submit → calls api.createTopic(topicData)
      ↓
3. Axios sends POST /api/topics/
      with JWT token in header
      ↓
4. Django REST Framework receives request
      ↓
5. TopicViewSet.perform_create()
      validates data + saves to database
      ↓
6. Django sends JSON response
      ↓
7. Frontend receives topic data
      ↓
8. Navigate to /topic/:id
```

### Example: Authentication Flow

```
1. User submits login form
      ↓
2. api.login(credentials) called
      ↓
3. POST /api/auth/login/
      ↓
4. Backend validates credentials
      ↓
5. JWT tokens generated
      ↓
6. Response: { user, profile, tokens }
      ↓
7. AuthContext.login() stores:
   - tokens in localStorage
   - user data in React state
      ↓
8. Header re-renders with user menu
```

---

## 📡 API Endpoints

### Base URL: `http://localhost:8000/api/`

### Authentication Endpoints (`/api/auth/`)
```
POST   /auth/register/              Create new user
POST   /auth/login/                 Login user
POST   /auth/logout/                Logout user
GET    /auth/me/                    Get current user
POST   /auth/token/refresh/         Refresh JWT token
```

### Category Endpoints (`/api/categories/`)
```
GET    /categories/                 List all categories
POST   /categories/                 Create category (admin)
GET    /categories/{id}/            Get single category
PUT    /categories/{id}/            Update category (admin)
DELETE /categories/{id}/            Delete category (admin)
```

### Topic Endpoints (`/api/topics/`)
```
GET    /topics/                     List all topics
POST   /topics/                     Create topic (authenticated)
GET    /topics/{id}/                Get single topic with replies
PUT    /topics/{id}/                Update topic (author only)
DELETE /topics/{id}/                Delete topic (author only)
GET    /topics/{id}/increment_views/ Increment view count
POST   /topics/{id}/replies/        Create reply (authenticated)
POST   /topics/{id}/bookmark/       Bookmark/unbookmark (authenticated)
```

### Reply Endpoints (`/api/replies/`)
```
GET    /replies/                    List all replies
POST   /replies/                    Create reply (authenticated)
GET    /replies/{id}/               Get single reply
PUT    /replies/{id}/               Update reply (author only)
DELETE /replies/{id}/               Delete reply (author only)
POST   /replies/{id}/like/          Like/unlike reply (authenticated)
```

### Profile Endpoints (`/api/profiles/`)
```
GET    /profiles/                   List all profiles
GET    /profiles/{id}/              Get single profile
GET    /profiles/top_members/       Get top 10 users by points
GET    /profiles/{id}/replies/      Get user's replies
GET    /profiles/{id}/topics/       Get user's topics
GET    /profiles/{id}/bookmarks/    Get user's bookmarks
```

### Report Endpoints (`/api/reports/`)
```
GET    /report-reasons/             List available report reasons
GET    /reports/                    List user's reports
POST   /reports/                    Create report (authenticated)
GET    /reports/{id}/               Get report details
PUT    /reports/{id}/               Update report (staff only)
```

---

## 🔐 Authentication Flow

### JWT Token System

**Token Storage:**
```javascript
localStorage.setItem('access_token', token)    // Short-lived (1 hour)
localStorage.setItem('refresh_token', token)   // Long-lived (7 days)
localStorage.setItem('user', JSON.stringify(user))
localStorage.setItem('profile', JSON.stringify(profile))
```

**Token Usage:**
1. Access token attached to every API request
2. If access token expires (401 error), automatically refresh
3. If refresh fails, redirect to login

**Interceptor Flow:**
```javascript
Request → Add Bearer token → Send
                ↓
        Response 401?
                ↓
        Try refresh token
                ↓
        Success? → Retry request
        Failed?  → Redirect to login
```

---

## ✨ Key Features

### 1. **Category System**
- Multiple forum categories with icons
- Topic count per category
- Filter topics by category

### 2. **Topic Management**
- Create, edit, delete topics
- Rich text content
- View counting
- Bookmark topics
- Update timestamps

### 3. **Reply System**
- Nested replies under topics
- Like/unlike replies
- Reply count tracking
- Hide inappropriate replies

### 4. **User Profiles**
- User points/reputation system
- Avatar (emoji-based)
- Bio field
- View user's topics, replies, bookmarks

### 5. **Search Functionality**
- Search topics by title/content
- Filter by category
- Sort by latest, trending, top

### 6. **Moderation**
- Report inappropriate replies
- Pre-defined report reasons
- Report status tracking
- Hide reported content

### 7. **Bookmarks**
- Save topics for later
- View all bookmarked topics
- Quick bookmark toggle

### 8. **Responsive Design**
- Mobile-friendly layout
- Sidebar with stats
- Dropdown menus
- Modal dialogs

---

## 🚀 How to Run

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Mac/Linux
# venv\Scripts\activate   # On Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py populate_data  # Load sample data
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm start
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

---

## 🔍 Understanding the Code

### To add a new feature:

1. **Add Model** → `backend/forum/models.py`
2. **Create Serializer** → `backend/forum/serializers.py`
3. **Add ViewSet** → `backend/forum/views.py`
4. **Register Route** → `backend/forum/urls.py`
5. **Run Migration** → `python manage.py makemigrations && python manage.py migrate`
6. **Add API Function** → `frontend/src/services/api.js`
7. **Create Component** → `frontend/src/components/YourComponent.js`
8. **Add Route** → `frontend/src/App.js`

### Common Development Tasks:

**Add new API endpoint:**
```python
# backend/forum/views.py
@action(detail=True, methods=['post'])
def custom_action(self, request, pk=None):
    # Your logic here
    return Response({'status': 'success'})
```

**Add new frontend page:**
```javascript
// frontend/src/components/NewPage.js
import { useAuth } from '../context/AuthContext';
import { getTopics } from '../services/api';

function NewPage() {
  const { user } = useAuth();
  // Your component logic
}
```

---

## 📚 Further Reading

- **Django REST Framework**: https://www.django-rest-framework.org/
- **React Router**: https://reactrouter.com/
- **JWT Authentication**: https://jwt.io/
- **Axios**: https://axios-http.com/

---

**Last Updated**: October 31, 2025
