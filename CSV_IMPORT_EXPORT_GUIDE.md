# CSV Import/Export Guide

## Overview
The Django admin now supports importing and exporting data in CSV format for all models in both the Forum and Gamification apps.

## Features Added

### ✅ Forum App Models with Import/Export:
- **Categories** - Forum categories
- **Category Rules** - Rules for each category
- **Tags** - Topic tags
- **Topics** - Forum topics/posts
- **Replies** - Topic replies
- **User Profiles** - User profile information
- **Bookmarks** - User bookmarks
- **Report Reasons** - Available report reasons
- **Reports** - User reports
- **Topic Images** - Images attached to topics
- **Polls** - Poll questions
- **Poll Options** - Poll answer options
- **Poll Votes** - User poll votes

### ✅ Gamification App Models with Import/Export:
- **Levels** - XP levels and requirements
- **User Levels** - User XP and level data
- **Badges** - Badge definitions
- **User Badges** - User badge progress and unlocks
- **User Streaks** - Daily activity streaks

## How to Use

### Exporting Data

1. **Go to Django Admin** - Navigate to http://localhost:8000/admin/
2. **Select a Model** - Click on any model (e.g., Badges, Topics, etc.)
3. **Click "Export"** - Button is at the top right of the list page
4. **Choose Format** - Select CSV, Excel (xlsx), or other formats
5. **Download** - File will be downloaded to your computer

### Importing Data

1. **Go to Django Admin** - Navigate to http://localhost:8000/admin/
2. **Select a Model** - Click on any model
3. **Click "Import"** - Button is at the top right of the list page
4. **Choose File** - Select your CSV file
5. **Preview** - Review the changes before importing
6. **Confirm** - Click "Confirm import" to save the data

## CSV Format Examples

### Badges CSV Format
```csv
name,icon,category,description,requirement,requirement_count,xp_reward,is_active,order
"First Post","📚","contribution","Created your first forum post","Create 1 post",1,50,True,1
"10 Posts","📝","contribution","Posted 10 topics in the forum","Create 10 posts",10,100,True,2
```

### Levels CSV Format
```csv
level_number,name,xp_required,icon,color,is_active
1,"Newbie",0,"⭐","#3b82f6",True
2,"Beginner",100,"🌟","#10b981",True
3,"Intermediate",250,"💫","#f59e0b",True
```

### Topics CSV Format
```csv
id,title,content,author__username,category__title,views,created_at
1,"My First Topic","This is the content","john_doe","General Discussion",100,"2025-11-04 10:00:00"
```

### User Profiles CSV Format
```csv
user__username,bio,location,website,points
"john_doe","I love cars!","New York","https://example.com",150
```

## Tips

### Best Practices
1. **Backup First** - Always export your current data before importing
2. **Test with Small Files** - Test imports with a few records first
3. **Use Correct Format** - Make sure your CSV matches the expected format
4. **Foreign Keys** - Use related object fields (e.g., `author__username` instead of author ID)
5. **Date Format** - Use ISO format: `YYYY-MM-DD HH:MM:SS`

### Common Use Cases

**Bulk Badge Creation:**
- Create badges in spreadsheet
- Export as CSV
- Import to database

**Data Migration:**
- Export from production
- Import to development
- Test new features

**Backup and Restore:**
- Regular exports for backup
- Quick restore when needed

**Data Analysis:**
- Export user data
- Analyze in Excel/Google Sheets
- Make informed decisions

## Supported Formats

The import/export feature supports:
- **CSV** (.csv)
- **Excel** (.xlsx, .xls)
- **JSON** (.json)
- **YAML** (.yaml)
- **TSV** (.tsv)
- **ODS** (.ods)

## Troubleshooting

### Import Errors
- **Validation errors** - Check that required fields are filled
- **Foreign key errors** - Ensure related objects exist
- **Date format errors** - Use ISO format (YYYY-MM-DD)
- **Duplicate errors** - Check for unique constraints

### Permission Issues
- Only superusers can import/export
- Staff users need appropriate permissions

## Examples

### Example 1: Bulk Import Badges
```csv
name,icon,category,description,requirement,requirement_count,xp_reward,is_active,order
"Speed Demon","🏎️","special","Created a topic in under 1 minute","Quick post",1,25,True,20
"Night Owl","🦉","special","Posted at midnight","Post at 00:00",1,30,True,21
```

### Example 2: Update User Levels
```csv
user__username,xp,level
"alice",500,5
"bob",750,6
"charlie",1000,7
```

### Example 3: Import Categories
```csv
id,title,description,icon
1,"General Discussion","Talk about anything","💬"
2,"Technical Help","Get help with car problems","🔧"
3,"Show Off","Share your ride","🚗"
```

## Notes

- **Import ID Fields** are used to update existing records or create new ones
- **Related Fields** use double underscore notation (e.g., `user__username`)
- **Boolean Fields** accept: `True/False`, `1/0`, `Yes/No`
- **Dates** should be in ISO format or your database's native format

---

**Need Help?** 
Check the Django Import-Export documentation: https://django-import-export.readthedocs.io/
