# Quick Deployment Checklist

## Pre-Deployment

- [ ] Test build locally: `npm run build`
- [ ] Update `.env.production` with correct API URL
- [ ] Commit all changes to Git
- [ ] Push to GitHub: `git push origin main`

## Render Setup

1. Go to Render Dashboard
2. Create New Web Service
3. Connect GitHub repository
4. Configure:
   - Name: `carforum-nextjs`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Node Version: `20.11.0`

## Environment Variables

Add in Render dashboard:

```
NODE_VERSION=20.11.0
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://your-frontend.onrender.com
NODE_ENV=production
```

## Post-Deployment

- [ ] Wait for build to complete
- [ ] Test the deployed site
- [ ] Update backend CORS with frontend URL
- [ ] Test API calls from frontend
- [ ] Test authentication flow

## Files Created

- `render.yaml` - Render configuration
- `build.sh` - Build script
- Updated `next.config.ts` - Production config
- Updated `.env.production` - Environment vars
- `RENDER_DEPLOYMENT.md` - Full guide

## Quick Commands

```bash
# Test locally
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy changes
git add .
git commit -m "Update"
git push origin main
```

## Troubleshooting

**Build fails:** Check package.json and run `npm install` locally

**API errors:** Verify CORS settings in backend and API URL

**404 on refresh:** Next.js handles this automatically

**Performance:** Consider upgrading Render plan
