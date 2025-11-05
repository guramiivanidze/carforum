# 🔒 Django Security Checklist

## ✅ **IMPLEMENTED** (Current Status)

### Critical Security Settings
- ✅ **SECRET_KEY**: Loaded from environment variable (NO default fallback in production)
- ✅ **DEBUG**: Set to False in production (default=False)
- ✅ **ALLOWED_HOSTS**: Properly configured from environment
- ✅ **Database Credentials**: Using environment variables
- ✅ **Cloudinary Credentials**: Using environment variables

### HTTPS & SSL
- ✅ **SECURE_SSL_REDIRECT**: Enabled in production
- ✅ **SESSION_COOKIE_SECURE**: Cookies only sent over HTTPS
- ✅ **CSRF_COOKIE_SECURE**: CSRF cookies only over HTTPS
- ✅ **SECURE_HSTS_SECONDS**: 1 year (31536000)
- ✅ **SECURE_HSTS_INCLUDE_SUBDOMAINS**: Enabled
- ✅ **SECURE_HSTS_PRELOAD**: Enabled
- ✅ **SECURE_PROXY_SSL_HEADER**: Configured for Render.com

### Headers & Browser Protection
- ✅ **SECURE_BROWSER_XSS_FILTER**: XSS protection enabled
- ✅ **SECURE_CONTENT_TYPE_NOSNIFF**: Prevents MIME sniffing
- ✅ **X_FRAME_OPTIONS**: Set to DENY (clickjacking protection)
- ✅ **SECURE_REFERRER_POLICY**: Set to 'same-origin'

### Cookie Security
- ✅ **SESSION_COOKIE_HTTPONLY**: JavaScript cannot access session cookies
- ✅ **CSRF_COOKIE_HTTPONLY**: JavaScript cannot access CSRF cookies
- ✅ **SESSION_COOKIE_SAMESITE**: Set to 'Lax'
- ✅ **CSRF_COOKIE_SAMESITE**: Set to 'Lax'

### CORS Configuration
- ✅ **CORS_ALLOW_ALL_ORIGINS**: Only in DEBUG mode
- ✅ **CORS_ALLOWED_ORIGINS**: Restricted in production
- ✅ **CORS_ALLOW_CREDENTIALS**: Enabled
- ✅ **CORS_ALLOW_HEADERS**: Explicitly defined

### Authentication & Passwords
- ✅ **Password Validators**: All 4 validators enabled
  - UserAttributeSimilarityValidator
  - MinimumLengthValidator
  - CommonPasswordValidator
  - NumericPasswordValidator

### JWT Token Security
- ✅ **ACCESS_TOKEN_LIFETIME**: 15 minutes (short-lived)
- ✅ **REFRESH_TOKEN_LIFETIME**: 7 days
- ✅ **ROTATE_REFRESH_TOKENS**: Enabled
- ✅ **BLACKLIST_AFTER_ROTATION**: Enabled
- ✅ **JTI_CLAIM**: Unique token tracking

### API Rate Limiting
- ✅ **Anonymous Users**: 100 requests/hour
- ✅ **Authenticated Users**: 1000 requests/hour

### File Security
- ✅ **.gitignore**: Properly configured
  - .env files
  - db.sqlite3
  - *.log files
  - media/ directory
  - SSL certificates
  - Backup files

---

## ⚠️ **RECOMMENDATIONS** (Consider Implementing)

### 1. Environment Variables Validation
Create a `check_env.py` script to validate all required environment variables exist:

```python
# backend/check_env.py
import os
from decouple import config

REQUIRED_ENV_VARS = [
    'SECRET_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'DATABASE_URL',  # In production
    'ALLOWED_HOSTS',
    'CORS_ALLOWED_ORIGINS',
]

def check_environment():
    missing = []
    for var in REQUIRED_ENV_VARS:
        try:
            value = config(var)
            if not value or value == '':
                missing.append(var)
        except:
            missing.append(var)
    
    if missing:
        raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")
    
    print("✅ All required environment variables are set")

if __name__ == '__main__':
    check_environment()
```

### 2. Django Admin Security

Add to `settings.py`:
```python
# Rename admin URL to prevent automated attacks
ADMIN_URL = config('ADMIN_URL', default='admin/')

# In urls.py, use:
# path(settings.ADMIN_URL, admin.site.urls),
```

Add to `.env`:
```
ADMIN_URL=secure-admin-panel-xyz123/
```

### 3. Database Backup Strategy

**Recommendation**: Set up automated backups for production database
- Render.com: Use their backup addon
- Or use cron job to backup to cloud storage

### 4. Logging & Monitoring

Add to `settings.py`:
```python
if not DEBUG:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'file': {
                'level': 'WARNING',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': BASE_DIR / 'logs/django.log',
                'maxBytes': 1024*1024*10,  # 10MB
                'backupCount': 5,
                'formatter': 'verbose',
            },
        },
        'root': {
            'handlers': ['file'],
            'level': 'WARNING',
        },
        'loggers': {
            'django.security': {
                'handlers': ['file'],
                'level': 'WARNING',
                'propagate': False,
            },
        },
    }
```

### 5. Content Security Policy (CSP)

Install: `pip install django-csp`

Add to `INSTALLED_APPS`:
```python
'csp',
```

Add to `MIDDLEWARE`:
```python
'csp.middleware.CSPMiddleware',
```

Add to `settings.py`:
```python
# Content Security Policy
if not DEBUG:
    CSP_DEFAULT_SRC = ("'self'",)
    CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net")
    CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "https://fonts.googleapis.com")
    CSP_FONT_SRC = ("'self'", "https://fonts.gstatic.com")
    CSP_IMG_SRC = ("'self'", "data:", "https://res.cloudinary.com")
    CSP_CONNECT_SRC = ("'self'",)
```

### 6. Two-Factor Authentication (2FA)

Install: `pip install django-otp qrcode`

For admin users:
```python
INSTALLED_APPS += [
    'django_otp',
    'django_otp.plugins.otp_totp',
]

MIDDLEWARE += [
    'django_otp.middleware.OTPMiddleware',
]
```

### 7. Dependency Security Scanning

Add to development workflow:
```bash
# Install safety
pip install safety

# Check for known vulnerabilities
safety check

# Or use pip-audit
pip install pip-audit
pip-audit
```

### 8. SQL Injection Protection

**Already Protected** by Django ORM, but ensure:
- ✅ Never use raw SQL with user input
- ✅ Always use parameterized queries
- ✅ Use Django ORM methods

### 9. File Upload Security

Add to models with file uploads:
```python
from django.core.validators import FileExtensionValidator

class YourModel(models.Model):
    file = models.FileField(
        validators=[
            FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png', 'pdf']
            )
        ]
    )
```

### 10. API Versioning

Add API versioning for better security management:
```python
# urls.py
urlpatterns = [
    path('api/v1/', include('api.v1.urls')),
    # Future: path('api/v2/', include('api.v2.urls')),
]
```

---

## 🚨 **CRITICAL ACTIONS REQUIRED**

### 1. Set Production Environment Variables

On Render.com, set these environment variables:

```bash
SECRET_KEY=<generate-strong-random-key>
DEBUG=False
ALLOWED_HOSTS=carforum.onrender.com,www.carforum.onrender.com
CORS_ALLOWED_ORIGINS=https://carforum.onrender.com
DATABASE_URL=<provided-by-render>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
```

**Generate SECRET_KEY**:
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2. Review User Permissions

```bash
# Check superuser accounts
python manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.filter(is_superuser=True)
```

Remove unnecessary admin accounts!

### 3. Enable HTTPS Everywhere

- ✅ Render.com provides free SSL
- ✅ Update frontend to use HTTPS URLs only
- ✅ No mixed content (HTTP resources on HTTPS pages)

### 4. Regular Security Updates

```bash
# Update dependencies regularly
pip list --outdated
pip install --upgrade <package-name>

# Update Django
pip install --upgrade django
```

---

## 📋 **Security Testing Checklist**

Before deploying to production:

- [ ] Run `python manage.py check --deploy`
- [ ] Test with DEBUG=False locally
- [ ] Verify all environment variables are set
- [ ] Test authentication flows
- [ ] Test CSRF protection
- [ ] Test rate limiting
- [ ] Check for exposed secrets in Git history
- [ ] Review admin user accounts
- [ ] Test file upload restrictions
- [ ] Verify HTTPS redirect works
- [ ] Check CORS headers
- [ ] Test JWT token expiration
- [ ] Review API permissions

---

## 🔍 **Regular Security Audits**

### Weekly
- Review access logs for suspicious activity
- Check for failed login attempts

### Monthly
- Update dependencies (`pip list --outdated`)
- Review user accounts and permissions
- Check for new Django security releases

### Quarterly
- Full security audit
- Review and update secrets (rotate keys)
- Penetration testing (optional)

---

## 📚 **Resources**

- [Django Security Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security Documentation](https://docs.djangoproject.com/en/stable/topics/security/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

## ⚡ **Quick Security Test**

Run this command to check your Django security settings:

```bash
python manage.py check --deploy
```

This will give you warnings about any security issues!
