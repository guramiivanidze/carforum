# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Updated requirements.txt with production dependencies
- [x] Updated settings.py for production
- [x] Created build.sh script
- [x] Created render.yaml configuration
- [x] Created .env.example for reference
- [x] Added WhiteNoise for static files
- [x] Configured PostgreSQL database support
- [x] Set up Cloudinary for media files
- [x] Added security settings for production

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### 2. Create PostgreSQL Database
- Go to Render Dashboard → New → PostgreSQL
- Name: `carforum-db`
- Save the Internal Database URL

### 3. Create Web Service
- New → Web Service
- Connect GitHub repo
- Root Directory: `backend`
- Build Command: `./build.sh`
- Start Command: `gunicorn carforum_backend.wsgi:application`

### 4. Set Environment Variables
```
SECRET_KEY = <Generate>
DEBUG = False
ALLOWED_HOSTS = <your-app>.onrender.com
DATABASE_URL = <from PostgreSQL>
CLOUDINARY_CLOUD_NAME = <your-value>
CLOUDINARY_API_KEY = <your-value>
CLOUDINARY_API_SECRET = <your-value>
CORS_ALLOWED_ORIGINS = <your-frontend-url>
```

### 5. Deploy & Test
- Wait for deployment to complete
- Test API endpoints
- Create superuser via Shell

## 📝 Important URLs

- Backend API: `https://<your-app>.onrender.com/api/`
- Admin Panel: `https://<your-app>.onrender.com/admin/`
- Database: Render PostgreSQL Dashboard

## 🔧 Common Commands

### Create Superuser
```bash
# In Render Shell
python manage.py createsuperuser
```

### Collect Static Files (if needed)
```bash
python manage.py collectstatic --no-input
```

### Run Migrations (if needed)
```bash
python manage.py migrate
```

### View Logs
- Render Dashboard → Your Service → Logs

## ⚠️ Remember

- Free tier spins down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds
- Update CORS_ALLOWED_ORIGINS when you deploy frontend
- Never commit .env files to GitHub
- Use environment variables for all secrets

## 🎯 Next Steps After Backend Deployment

1. Note your backend URL: `https://<your-app>.onrender.com`
2. Deploy frontend to Vercel/Netlify
3. Update frontend API endpoint
4. Update CORS_ALLOWED_ORIGINS with frontend URL
5. Test complete application flow
6. Create initial content via admin panel
