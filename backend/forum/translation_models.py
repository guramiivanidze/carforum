from django.db import models


class Translation(models.Model):
    """
    Model to store translatable text content for the frontend.
    Each entry has a unique key and translations in Georgian and English.
    """
    LANGUAGE_CHOICES = [
        ('ka', 'Georgian'),
        ('en', 'English'),
    ]
    
    # Unique identifier for the text (e.g., 'header.search_placeholder', 'login.title')
    key = models.CharField(max_length=200, unique=True, db_index=True,
                          help_text="Unique key to identify this translation (e.g., 'header.search_placeholder')")
    
    # Georgian translation
    text_ka = models.TextField(verbose_name="Georgian Text",
                              help_text="Text in Georgian language")
    
    # English translation
    text_en = models.TextField(verbose_name="English Text",
                              help_text="Text in English language")
    
    # Optional description for context
    description = models.TextField(blank=True,
                                  help_text="Description of where this text is used")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True,
                                   help_text="Whether this translation is active")
    
    class Meta:
        ordering = ['key']
        verbose_name = 'Translation'
        verbose_name_plural = 'Translations'
    
    def __str__(self):
        return f"{self.key} (KA: {self.text_ka[:30]}... | EN: {self.text_en[:30]}...)"
    
    def get_translation(self, language='ka'):
        """Get translation for specific language"""
        if language == 'en':
            return self.text_en
        return self.text_ka
