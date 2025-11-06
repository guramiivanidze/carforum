# Environment Variables Setup

This document explains how to set up environment variables for the Next.js frontend.

> **📖 Related Documentation:**
> - [Centralized API Configuration](./CENTRALIZED_API_CONFIG.md) - Learn about the centralized API URL management system

## 📁 Environment Files

We use different environment files for different scenarios:

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env.example` | Template with all available variables | ✅ Yes |
| `.env.local` | Local development settings | ❌ No (gitignored) |
| `.env.production` | Production deployment settings | ✅ Yes |

## 🚀 Quick Start

### 1. Local Development Setup

**Option A: Copy from example** (recommended)
```bash
cp .env.example .env.local
```

**Option B: Manual creation**
Create a file named `.env.local` in the root of `nextjs-front/` with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
GENERATE_SOURCEMAP=true
```

### 2. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:3000` and connect to Django backend at `http://localhost:8000`.

## 📝 Environment Variables Reference

### Required Variables

#### `NEXT_PUBLIC_API_URL`
- **Description**: Backend API endpoint URL
- **Local**: `http://localhost:8000/api`
- **Production**: `https://carforum.onrender.com/api`
- **Note**: Must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser

#### `NEXT_PUBLIC_SITE_URL`
- **Description**: Frontend site URL (used for SEO, sitemaps, canonical URLs)
- **Local**: `http://localhost:3000`
- **Production**: `https://carforum-nextjs.onrender.com`

#### `NODE_ENV`
- **Description**: Node environment mode
- **Values**: `development` | `production`
- **Local**: `development`
- **Production**: `production`

#### `GENERATE_SOURCEMAP`
- **Description**: Enable/disable source maps
- **Local**: `true` (easier debugging)
- **Production**: `false` (smaller bundle, faster build)

## 🔒 Security Notes

1. **Never commit `.env.local`** - It's gitignored by default
2. **Be careful with API keys** - Only commit `.env.production` if it doesn't contain secrets
3. **Use `NEXT_PUBLIC_` prefix** - Only for variables that need to be exposed to the browser
4. **Server-only variables** - Don't use `NEXT_PUBLIC_` prefix for sensitive data (they'll be private)

## 🌍 Deployment

### Render.com

Environment variables are set in the Render dashboard:
1. Go to your service → Settings → Environment
2. Add each variable from `.env.production`
3. Render automatically rebuilds when you save changes

### Vercel

Environment variables are set in the Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add variables for Production, Preview, and Development
3. Redeploy to apply changes

## 🐛 Troubleshooting

### Issue: `NEXT_PUBLIC_API_URL` is undefined
**Solution**: Make sure the variable name starts with `NEXT_PUBLIC_` and restart dev server

### Issue: Changes to `.env.local` not taking effect
**Solution**: Restart the development server (`npm run dev`)

### Issue: API connection fails in production
**Solution**: Verify `NEXT_PUBLIC_API_URL` in Render dashboard matches your backend URL

### Issue: 404 errors on deployed site
**Solution**: Check `NEXT_PUBLIC_SITE_URL` matches your actual deployment URL

## 📚 Additional Resources

- [Next.js Environment Variables Docs](https://nextjs.org/docs/basic-features/environment-variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated**: November 6, 2025
