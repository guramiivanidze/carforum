# Frontend Deployment Guide for Render

## 📋 Overview

This guide will help you deploy your React frontend to Render as a static site.

## ✅ Prerequisites

- [x] Backend deployed and running on Render
- [x] Backend URL noted (e.g., `https://carforum-backend.onrender.com`)
- [ ] GitHub repository updated with frontend changes
- [ ] Render account created

## 🚀 Deployment Steps

### Step 1: Update Backend CORS Settings

Before deploying frontend, update your backend's CORS settings:

1. Go to your **backend service** on Render
2. Go to **Environment** tab
3. Update `CORS_ALLOWED_ORIGINS` to include your frontend URL:
   ```
   https://carforum-frontend.onrender.com
   ```
   (Or your custom domain if using one)

4. **Save** and wait for the backend to redeploy

### Step 2: Push Frontend Changes to GitHub

```bash
cd frontend
git add .
git commit -m "Prepare frontend for Render deployment"
git push origin main
```

### Step 3: Create Static Site on Render

1. **Go to Render Dashboard** → Click **"New +"** → Select **"Static Site"**

2. **Connect GitHub Repository:**
   - Select your `carforum` repository
   - Click **"Connect"**

3. **Configure the Static Site:**

   **Basic Settings:**
   - **Name:** `carforum-frontend` (or your preferred name)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `build`

4. **Set Environment Variable:**
   
   Click **"Advanced"** and add:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-app.onrender.com/api`
     (Replace with your actual backend URL)

5. **Click "Create Static Site"**

### Step 4: Configure Routing (SPA Support)

After the site is created, configure client-side routing:

1. Go to your static site dashboard
2. Go to **"Redirects/Rewrites"** tab
3. Add a rewrite rule:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`

This ensures React Router works correctly.

### Step 5: Update Backend CORS (Final)

Once your frontend is deployed, update backend CORS with the actual URL:

1. Go to **backend service** on Render
2. **Environment** tab
3. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://carforum-frontend.onrender.com
   ```
   (Use your actual frontend URL)

4. **Save** changes

### Step 6: Test Your Application

1. Visit your frontend URL: `https://carforum-frontend.onrender.com`
2. Test key features:
   - ✅ Homepage loads
   - ✅ Can browse topics/categories
   - ✅ Can register/login
   - ✅ Can create topics/replies
   - ✅ Images upload correctly
   - ✅ User profiles work

## 🔧 Environment Variables

Set these in Render's Environment tab for your static site:

| Variable | Value | Example |
|----------|-------|---------|
| `REACT_APP_API_URL` | Your backend API URL | `https://carforum-backend.onrender.com/api` |
| `NODE_VERSION` | Node.js version | `18` |

## 📝 Important Notes

### Free Tier Limitations

- Static sites on Render's free tier are always active (no spin-down)
- CDN-backed for fast global delivery
- Automatic deployments on git push

### Custom Domain (Optional)

1. Go to your static site → **"Settings"** → **"Custom Domain"**
2. Add your domain (e.g., `forum.yoursite.com`)
3. Update DNS records as shown
4. Update CORS settings in backend with new domain

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:** Verify CORS settings in backend
```python
# backend/carforum_backend/settings.py
CORS_ALLOWED_ORIGINS = [
    'https://carforum-frontend.onrender.com',
    # Add any custom domains
]
```

### Issue: 404 on page refresh

**Solution:** Ensure redirect/rewrite rule is configured:
- Source: `/*`
- Destination: `/index.html`
- Action: Rewrite

### Issue: Backend URL not working

**Solution:** Check environment variable in Render:
1. Go to frontend static site
2. Environment tab
3. Verify `REACT_APP_API_URL` is correct
4. Trigger manual deploy to apply changes

### Issue: Old API URL still being used

**Solution:** React apps cache env variables during build
1. Update `REACT_APP_API_URL` in Render
2. Trigger manual deploy to rebuild with new variable
3. Clear browser cache if needed

## 🔄 Continuous Deployment

Render automatically deploys when you push to the connected branch:

```bash
# Make changes to frontend
cd frontend
git add .
git commit -m "Update feature"
git push origin main

# Render will automatically detect and deploy
```

## 📦 Build Optimization

### Reduce Build Size

1. **Remove unused dependencies:**
   ```bash
   npm prune
   ```

2. **Analyze bundle size:**
   ```bash
   npm run build
   # Check build/static/js file sizes
   ```

3. **Code splitting** is already enabled by create-react-app

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads correctly at Render URL
- [ ] API calls work (check browser console for errors)
- [ ] Authentication works (login/register)
- [ ] Images upload via Cloudinary
- [ ] All pages accessible (React Router working)
- [ ] No CORS errors in browser console
- [ ] Mobile responsive design works
- [ ] Backend CORS includes frontend URL
- [ ] Environment variables set correctly

## 📚 Useful Commands

### View Build Logs
Check build logs in Render dashboard under "Logs" tab

### Trigger Manual Deploy
Click "Manual Deploy" → "Deploy latest commit"

### Clear Build Cache
In Render dashboard: "Settings" → "Clear build cache" → "Manual Deploy"

## 🔗 Useful Links

- Frontend URL: `https://your-frontend.onrender.com`
- Backend URL: `https://your-backend.onrender.com`
- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs/static-sites

## 🎉 Success!

Once deployed:
1. Your frontend is live at `https://carforum-frontend.onrender.com`
2. Connected to your backend API
3. Automatically deploys on git push
4. Globally distributed via CDN

**Next steps:** Share your app URL and start building your community! 🚀
