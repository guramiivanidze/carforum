# Managing CORS Settings in Render Environment Variables

## Configuration

The backend now reads `CORS_ALLOWED_ORIGINS` from environment variables in Render.

### Format

In Render dashboard, set the environment variable as a **comma-separated list**:

```
CORS_ALLOWED_ORIGINS=https://carforum-nextjs.onrender.com,http://localhost:3000
```

### How to Set in Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Select your backend service: `carforum-backend`

2. **Navigate to Environment Tab**
   - Click "Environment" in the left sidebar

3. **Add/Update Variable**
   - Key: `CORS_ALLOWED_ORIGINS`
   - Value: `https://carforum-nextjs.onrender.com`
   
   Or for multiple origins:
   ```
   https://carforum-nextjs.onrender.com,https://your-custom-domain.com
   ```

4. **Save Changes**
   - Click "Save Changes"
   - Service will automatically redeploy

## Default Value

If `CORS_ALLOWED_ORIGINS` is not set, it defaults to:
```
https://carforum-nextjs.onrender.com,http://localhost:3000,http://127.0.0.1:3000
```

## Examples

### Single Origin (Production Only)
```
CORS_ALLOWED_ORIGINS=https://carforum-nextjs.onrender.com
```

### Multiple Origins
```
CORS_ALLOWED_ORIGINS=https://carforum-nextjs.onrender.com,https://carforum.example.com,https://www.carforum.example.com
```

### With Custom Domain
```
CORS_ALLOWED_ORIGINS=https://carforum-nextjs.onrender.com,https://forum.yourdomain.com
```

## Important Notes

- **No spaces** around commas
- **Include protocol** (https:// or http://)
- **No trailing slashes**
- **Case sensitive**

## Testing

After updating:

1. Wait for automatic redeploy (~2-3 minutes)
2. Visit your frontend: https://carforum-nextjs.onrender.com
3. Open DevTools Console (F12)
4. Refresh page
5. Verify no CORS errors

## Troubleshooting

### CORS errors still appearing?

**Check the value format:**
```
✅ Correct: https://carforum-nextjs.onrender.com
❌ Wrong: https://carforum-nextjs.onrender.com/
❌ Wrong: carforum-nextjs.onrender.com
❌ Wrong: https://carforum-nextjs.onrender.com, http://localhost:3000 (space after comma)
```

**Verify in logs:**
After deployment, check backend logs for:
```
CORS_ALLOWED_ORIGINS: ['https://carforum-nextjs.onrender.com']
```

### Need to add a new domain?

1. Edit the environment variable in Render
2. Add new domain to the comma-separated list
3. Save (triggers automatic redeploy)

## Alternative: Local .env File

For local development, create `backend/.env`:

```bash
DEBUG=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Development mode (`DEBUG=True`) allows all origins by default.

## Files Modified

- ✅ `backend/carforum_backend/settings.py` - Reads from environment variable
- ✅ `backend/render.yaml` - Sets default value in blueprint

## Summary

You can now manage CORS origins directly from Render's dashboard without code changes. Just update the `CORS_ALLOWED_ORIGINS` environment variable and the service will automatically redeploy with new settings.

---

**Current Setup:**
- Variable: `CORS_ALLOWED_ORIGINS`
- Default: `https://carforum-nextjs.onrender.com,http://localhost:3000,http://127.0.0.1:3000`
- Format: Comma-separated list (no spaces)
