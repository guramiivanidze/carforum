# Car Forum

A web application with Django backend and React frontend.

## 🎉 Recent Updates

### Frontend Refactoring Complete ✅

The frontend has undergone comprehensive refactoring to improve code quality, performance, and developer experience:

#### Phase 1: JavaScript/API Refactoring ✅
- ✅ **API Caching System** - 60-70% reduction in API requests
- ✅ **Custom React Hooks** - 60% less boilerplate code
- ✅ **Comprehensive Documentation** - All API functions documented with JSDoc
- ✅ **Enhanced Context Providers** - Optimized Auth and Categories contexts

#### Phase 2: CSS Refactoring ✅
- ✅ **Design Token System** - 60+ CSS variables for consistency
- ✅ **Utility Classes** - 500+ reusable CSS classes (Tailwind-inspired)
- ✅ **Build Verified** - Only +3.44 KB bundle size increase
- ✅ **Documentation** - Complete CSS architecture guides

**📚 See [FRONTEND_DOCUMENTATION_INDEX.md](./FRONTEND_DOCUMENTATION_INDEX.md) for complete details!**

## Project Structure

```
carforum/
├── backend/          # Django REST API
│   ├── carforum_backend/
│   ├── venv/
│   ├── manage.py
│   └── requirements.txt
└── frontend/         # React application
    ├── src/
    ├── public/
    └── package.json
```

## Backend (Django)

### Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Run Development Server
```bash
python manage.py migrate
python manage.py runserver
```

The backend will run on `http://localhost:8000`

## Frontend (React)

### Setup
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Technologies Used

### Backend
- Django 5.2.7
- Django REST Framework 3.16.1
- Django CORS Headers 4.9.0

### Frontend
- React
- Create React App

## Development

- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- CORS is configured to allow communication between frontend and backend
