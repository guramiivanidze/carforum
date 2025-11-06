# Centralized API Configuration

## Overview

This document describes the centralized API URL management system implemented to fix 404 errors where Next.js was making requests to the frontend URL instead of the backend API URL.

## Problem Statement

The Next.js application was experiencing 404 errors because:
- React Server Components (RSC) were making requests to the frontend domain (`https://carforum-nextjs.onrender.com`) instead of the backend API domain (`https://carforum.onrender.com/api`)
- Different parts of the codebase were handling API URLs inconsistently
- Some code was adding protocol prefixes (`https://`) manually, causing duplication
- Server-side rendering and static generation contexts weren't consistently using environment variables

## Solution: Centralized Configuration

### Core File: `lib/config.ts`

A centralized configuration module that provides three main functions:

```typescript
/**
 * Get the API URL with protocol
 * Works in both server and client contexts
 * Automatically adds protocol based on environment
 */
export function getApiUrl(): string

/**
 * Get the site URL (frontend URL)
 * Returns the frontend domain with protocol
 */
export function getSiteUrl(): string

/**
 * Build a full API URL with the given path
 * Handles protocol, baseURL, and path joining
 */
export function buildApiUrl(path: string): string
```

### Key Features

1. **Protocol Handling**: Automatically adds `https://` in production or `http://` in development
2. **Environment Validation**: Throws clear errors if required environment variables are missing
3. **Server/Client Compatible**: Works in all Next.js contexts (SSR, SSG, CSR)
4. **Single Source of Truth**: One place to manage all API URL logic

## Files Updated

### 1. `lib/config.ts` (NEW)
- Created centralized API configuration module
- Exports: `getApiUrl()`, `getSiteUrl()`, `buildApiUrl()`

### 2. `lib/api.ts`
**Before:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

**After:**
```typescript
import { getApiUrl } from './config';
const API_URL = getApiUrl();
```

### 3. `lib/siteSettings.ts`
**Before:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Later in code:
let apiUrl = API_URL;
if (!apiUrl.startsWith('http')) {
  apiUrl = `https://${apiUrl}`;
}
```

**After:**
```typescript
import { getApiUrl, getSiteUrl } from './config';
const API_URL = getApiUrl(); // Already has protocol

// No manual protocol handling needed!
const fullUrl = `${API_URL}/site-settings/`;
```

### 4. `app/sitemap.ts`
**Before:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
let finalApiUrl = apiUrl;
if (!finalApiUrl.startsWith('http://') && !finalApiUrl.startsWith('https://')) {
  finalApiUrl = `https://${finalApiUrl}`;
}
const categoriesUrl = `${finalApiUrl}/categories/`;
```

**After:**
```typescript
import { buildApiUrl, getSiteUrl } from '@/lib/config';
const categoriesUrl = buildApiUrl('/categories/');
```

### 5. `contexts/SettingsContext.tsx`
**Before:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const response = await fetch(`${API_URL}/forum/site-settings/`, {
  cache: 'no-store',
});
```

**After:**
```typescript
import { buildApiUrl } from '@/lib/config';
const response = await fetch(buildApiUrl('/forum/site-settings/'), {
  cache: 'no-store',
});
```

## Environment Variables

### Required Variables

```bash
# Backend API URL (include protocol in production)
NEXT_PUBLIC_API_URL=https://carforum.onrender.com/api

# Frontend URL (include protocol)
NEXT_PUBLIC_SITE_URL=https://carforum-nextjs.onrender.com
```

### Local Development (.env.local)

```bash
# Backend API URL (local development)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Frontend URL (local development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NODE_ENV=development
```

## Usage Guidelines

### ✅ DO: Use Centralized Functions

```typescript
import { getApiUrl, getSiteUrl, buildApiUrl } from '@/lib/config';

// Get base API URL
const apiUrl = getApiUrl(); // http://localhost:8000/api (dev)

// Get frontend URL
const siteUrl = getSiteUrl(); // http://localhost:3000 (dev)

// Build full API endpoint URL
const categoriesUrl = buildApiUrl('/categories/'); 
// Result: http://localhost:8000/api/categories/
```

### ❌ DON'T: Access Environment Variables Directly

```typescript
// ❌ BAD: Direct environment variable access
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ❌ BAD: Manual protocol handling
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const fullUrl = `https://${apiUrl}`;

// ❌ BAD: Manual URL construction
const url = `${process.env.NEXT_PUBLIC_API_URL}/categories/`;
```

## Benefits

1. **Consistency**: All API requests use the same URL configuration logic
2. **Protocol Safety**: No more missing or duplicate protocols
3. **Error Prevention**: Clear error messages if environment variables are missing
4. **Maintainability**: Changes to URL logic happen in one place
5. **Type Safety**: TypeScript ensures correct usage
6. **Environment Agnostic**: Works correctly in all Next.js contexts (SSR, SSG, CSR)

## Troubleshooting

### Issue: "Missing required environment variable: NEXT_PUBLIC_API_URL"

**Solution**: Ensure `.env.local` (development) or environment variables (production) are set:
```bash
NEXT_PUBLIC_API_URL=https://carforum.onrender.com/api
```

### Issue: API requests still going to frontend URL

**Check:**
1. Is the file importing from `lib/config`?
2. Is it using `getApiUrl()` or `buildApiUrl()`?
3. Are environment variables correctly set?
4. Restart the dev server after changing env files

### Issue: Protocol duplicated (https://https://...)

**Cause**: Code is manually adding protocol when using centralized config

**Solution**: Remove manual protocol handling - `getApiUrl()` already includes it:
```typescript
// ❌ BAD
const url = `https://${getApiUrl()}/endpoint`;

// ✅ GOOD
const url = buildApiUrl('/endpoint');
```

## Testing

### Local Development
1. Set `.env.local` with `http://localhost:8000/api`
2. Run `npm run dev`
3. Check browser Network tab - requests should go to `localhost:8000`

### Production
1. Set environment variables in Render (or hosting platform)
2. Deploy
3. Check Network tab - requests should go to `https://carforum.onrender.com/api`
4. Check for 404 errors - should be resolved

## Migration Checklist

- [x] Create `lib/config.ts` with centralized functions
- [x] Update `lib/api.ts` to use `getApiUrl()`
- [x] Update `lib/siteSettings.ts` to use `getApiUrl()` and remove manual protocol handling
- [x] Update `app/sitemap.ts` to use `buildApiUrl()`
- [x] Update `contexts/SettingsContext.tsx` to use `buildApiUrl()`
- [x] Search for remaining `process.env.NEXT_PUBLIC_API_URL` usage (only in config.ts and next.config.ts is OK)
- [x] Test local development
- [ ] Deploy and test production
- [ ] Verify no 404 errors in production

## Next Steps

1. **Deploy to Production**: Push changes and verify on Render
2. **Monitor Logs**: Check for any API URL issues
3. **Update Documentation**: Ensure all team members know to use centralized config
4. **Add Tests**: Consider adding tests for config functions

## Related Files

- `lib/config.ts` - Core configuration module
- `lib/api.ts` - Axios client using centralized config
- `lib/siteSettings.ts` - Site settings fetcher
- `app/sitemap.ts` - Sitemap generator
- `contexts/SettingsContext.tsx` - Settings context provider
- `.env.local` - Local environment variables
- `.env.example` - Environment variable template
- `ENVIRONMENT.md` - Full environment setup guide
