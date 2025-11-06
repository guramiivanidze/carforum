# Next.js Frontend Deployment Guide for Render

This guide will help you deploy the Car Forum Next.js frontend to Render.

## Prerequisites

- Git repository pushed to GitHub
- Render account (sign up at https://render.com)
- Backend API already deployed and accessible

## Files Created for Deployment

### 1. `render.yaml`
Blueprint file for Render deployment with service configuration.

### 2. `build.sh`
Build script that runs during deployment.

### 3. Updated `next.config.ts`
Production-optimized Next.js configuration.

### 4. Updated `.env.production`
Production environment variables.

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare Next.js frontend for Render deployment"
   git push origin main
   ```

2. **Ensure your `.gitignore` includes:**
   ```
   .next/
   node_modules/
   .env.local
   .DS_Store
   ```

### Step 2: Deploy to Render

#### Option A: Using Blueprint (Recommended)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select the repository containing your Next.js app
5. Render will automatically detect `render.yaml`
6. Review the configuration:
   - **Name:** carforum-nextjs
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
7. Update environment variables if needed (see below)
8. Click **"Apply"**

#### Option B: Manual Setup

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** carforum-nextjs
   - **Region:** Oregon (or your preferred region)
   - **Branch:** main
   - **Root Directory:** `nextjs-front` (if repo contains multiple projects)
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or your preferred plan)

5. Add Environment Variables (see below)
6. Click **"Create Web Service"**

### Step 3: Configure Environment Variables

Add these environment variables in Render dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_VERSION` | `20.11.0` | Node.js version |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` | Backend API URL |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.onrender.com` | Frontend URL |
| `NODE_ENV` | `production` | Environment mode |

**Important:** Replace the URLs with your actual Render service URLs.

### Step 4: Update Backend CORS Settings

After deployment, update your backend's CORS settings to allow requests from your frontend URL:

In `backend/carforum_backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://your-frontend.onrender.com',  # Add your Render URL
]
```

Redeploy your backend after this change.

## Configuration Details

### Next.js Configuration (`next.config.ts`)

The configuration includes:

- **Standalone Output:** Optimized for serverless/container deployment
- **Image Optimization:** Configured for remote images
- **Compression:** Enabled for smaller bundle sizes
- **Source Maps:** Disabled in production for security
- **Security Headers:** Removed powered-by header

### Build Process

The build process:
1. Installs dependencies via `npm install`
2. Builds the Next.js app via `npm run build`
3. Generates optimized production bundle
4. Creates standalone output in `.next/standalone/`

### Runtime

- **Port:** Automatically assigned by Render (usually 10000)
- **Start Command:** `npm start` runs the production server
- **Health Check:** Monitors the root path `/`

## Post-Deployment Steps

### 1. Verify Deployment

1. Wait for build to complete (5-10 minutes)
2. Visit your Render URL
3. Check browser console for errors
4. Test main features:
   - Browse categories
   - View topics
   - Search functionality
   - User authentication

### 2. Set Up Custom Domain (Optional)

1. Go to your Render service settings
2. Navigate to **"Custom Domains"**
3. Add your domain (e.g., `forum.yourdomain.com`)
4. Update DNS records as instructed
5. Enable automatic HTTPS

### 3. Update Environment Variables

If you change your backend URL or other settings:
1. Go to Render dashboard
2. Select your service
3. Go to **"Environment"** tab
4. Update variables
5. Service will automatically redeploy

## Troubleshooting

### Build Fails

**Problem:** Build fails with "Module not found"

**Solution:**
```bash
# Locally test the build
npm install
npm run build
```

**Problem:** Out of memory during build

**Solution:** Upgrade to a paid Render plan with more resources.

### Runtime Errors

**Problem:** API calls fail (CORS errors)

**Solution:**
- Check backend CORS settings
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is running

**Problem:** 404 errors on page refresh

**Solution:** This should be handled automatically by Next.js routing. If issues persist, check Render logs.

### Performance Issues

**Problem:** Slow page loads

**Solution:**
- Upgrade to a paid plan
- Enable caching headers
- Optimize images
- Use CDN for static assets

## Monitoring

### View Logs

1. Go to Render dashboard
2. Select your service
3. Click **"Logs"** tab
4. View real-time logs

### Check Metrics

1. Go to Render dashboard
2. Select your service
3. View metrics:
   - Request count
   - Response time
   - Memory usage
   - CPU usage

## Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

Render will automatically redeploy.

### Manual Redeploy

1. Go to Render dashboard
2. Select your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Rollback

1. Go to Render dashboard
2. Select your service
3. Go to **"Events"** tab
4. Find previous successful deploy
5. Click **"Rollback"**

## Optimization Tips

### 1. Enable Caching

Add headers in `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:all*(svg|jpg|png|webp)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

### 2. Optimize Images

- Use Next.js Image component
- Serve images in WebP format
- Use proper sizing

### 3. Code Splitting

Next.js automatically code-splits, but you can optimize further:
- Use dynamic imports for large components
- Lazy load below-the-fold content

### 4. Analyze Bundle

```bash
npm install --save-dev @next/bundle-analyzer
```

Add to `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run analysis:
```bash
ANALYZE=true npm run build
```

## Security Checklist

- [ ] Environment variables set correctly
- [ ] CORS configured on backend
- [ ] Source maps disabled in production
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled (automatic on Render)
- [ ] Dependencies updated and audited
- [ ] CSP headers configured (if needed)

## Cost Optimization

### Free Tier Limitations

- Service spins down after 15 minutes of inactivity
- 750 hours/month free
- Limited bandwidth

### Upgrading

For production use, consider:
- **Starter Plan ($7/month):** No spin-down, custom domains
- **Standard Plan ($25/month):** More resources, better performance

## Support

### Resources

- Next.js Docs: https://nextjs.org/docs
- Render Docs: https://docs.render.com
- GitHub Issues: Your repository issues page

### Getting Help

1. Check Render logs first
2. Review this deployment guide
3. Search Render community forum
4. Contact Render support

## Deployment Checklist

Before deploying:
- [ ] All code committed and pushed to GitHub
- [ ] Backend API deployed and accessible
- [ ] Environment variables configured
- [ ] `.env.production` file updated
- [ ] Build tested locally
- [ ] CORS settings updated on backend

After deploying:
- [ ] Deployment successful on Render
- [ ] Frontend loads correctly
- [ ] API calls working
- [ ] Authentication functional
- [ ] Search working
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)

## Next Steps

1. Set up monitoring and alerts
2. Configure backup strategy
3. Plan for scaling
4. Set up CI/CD pipeline
5. Implement analytics
6. Add error tracking (Sentry, etc.)

---

**Deployed URL:** https://carforum-nextjs.onrender.com (update with your actual URL)

**Last Updated:** November 6, 2025
