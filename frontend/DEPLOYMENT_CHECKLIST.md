# Frontend Deployment Checklist

## ✅ Pre-Deployment

- [x] Created .env.example for reference
- [x] Updated api.js to use environment variable
- [x] Created render.yaml for static site
- [x] Created build.sh script
- [x] Created deployment documentation

## 🚀 Deployment Steps

### 1. Get Backend URL
```bash
# Your backend URL (from Render):
https://your-backend-app.onrender.com
```

### 2. Update Backend CORS First
- Go to backend service on Render
- Environment tab
- Add to `CORS_ALLOWED_ORIGINS`:
  ```
  https://carforum-frontend.onrender.com
  ```

### 3. Push to GitHub
```bash
cd frontend
git add .
git commit -m "Prepare frontend for Render deployment"
git push origin main
```

### 4. Create Static Site on Render
- New → Static Site
- Connect GitHub repo: `carforum`
- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `build`

### 5. Set Environment Variable
```
REACT_APP_API_URL = https://your-backend-app.onrender.com/api
```

### 6. Configure SPA Routing
In Redirects/Rewrites:
- Source: `/*`
- Destination: `/index.html`
- Action: Rewrite

### 7. Test Application
- [ ] Homepage loads
- [ ] API calls work
- [ ] Authentication works
- [ ] Can create topics/replies
- [ ] Images upload
- [ ] No CORS errors

## 📝 Environment Variables

```
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
NODE_VERSION=18
```

## 🎯 Quick Commands

### Local Development
```bash
npm start
```

### Build Locally
```bash
npm run build
```

### Test Production Build
```bash
npm run build
npx serve -s build
```

## ⚠️ Important

1. Frontend deploys automatically on git push
2. Static sites don't spin down (always active)
3. Update CORS in backend with frontend URL
4. Clear browser cache if changes don't appear

## 🔗 URLs After Deployment

- Frontend: `https://carforum-frontend.onrender.com`
- Backend: `https://your-backend-app.onrender.com`
- Admin: `https://your-backend-app.onrender.com/admin`

## 🐛 Common Issues

**CORS Error:**
- Check `CORS_ALLOWED_ORIGINS` in backend includes frontend URL

**404 on Refresh:**
- Add rewrite rule: `/*` → `/index.html`

**Environment Variable Not Working:**
- Must start with `REACT_APP_`
- Trigger manual deploy after changing env vars
