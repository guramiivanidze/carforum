# Installing Import/Export Feature

## Installation Steps

1. **Install the package:**
   ```bash
   cd c:\Users\givanidze\Desktop\carforum\backend
   pip install django-import-export
   ```

2. **The configuration is already added to:**
   - ✅ `requirements.txt` - Added `django-import-export==4.3.3`
   - ✅ `settings.py` - Added `'import_export'` to INSTALLED_APPS
   - ✅ `gamification/admin.py` - Updated with ImportExportModelAdmin
   - ✅ `forum/admin.py` - Updated with ImportExportModelAdmin

3. **Run migrations (if needed):**
   ```bash
   python manage.py migrate
   ```

4. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

5. **Access the admin panel:**
   - Go to: http://localhost:8000/admin/
   - Login with your superuser account
   - You'll now see "Import" and "Export" buttons on all model list pages

## Quick Test

1. Go to **Gamification > Badges**
2. Click **"Export"** button at the top
3. Select **CSV** format
4. Download will start
5. Open the CSV file to verify the data

## Next Steps

- Read the full guide: `CSV_IMPORT_EXPORT_GUIDE.md`
- Test import/export with different models
- Create bulk data in spreadsheets and import them

Enjoy your new import/export capabilities! 🎉
