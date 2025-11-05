from django.core.management.base import BaseCommand
from advertisements.models import AdBanner
from cloudinary.uploader import upload
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont


class Command(BaseCommand):
    help = 'Create test banners for all locations'

    def handle(self, *args, **options):
        # Banner configurations for each location
        banner_configs = [
            {
                'title': 'Home - Between Sections Banner',
                'location': 'home_between_sections',
                'size': 'large',
                'color': '#4f46e5',
                'text': 'Home Banner\nBetween Sections'
            },
            {
                'title': 'Home - Categories Grid Banner',
                'location': 'home_categories_grid',
                'size': 'card',
                'color': '#7c3aed',
                'text': 'Categories\nGrid Banner'
            },
            {
                'title': 'Home - Topics List Banner',
                'location': 'home_topics_list',
                'size': 'row',
                'color': '#2563eb',
                'text': 'Topics List Banner'
            },
            {
                'title': 'Sidebar Main Banner',
                'location': 'sidebar_main',
                'size': 'small',
                'color': '#0891b2',
                'text': 'Sidebar\nBanner'
            },
            {
                'title': 'Category Page - Header Banner',
                'location': 'category_header',
                'size': 'medium',
                'color': '#059669',
                'text': 'Category Header\nBanner'
            },
            {
                'title': 'Category Page - Topics List Banner',
                'location': 'category_topics_list',
                'size': 'row',
                'color': '#ca8a04',
                'text': 'Category Topics Banner'
            },
            {
                'title': 'Category Page - Sidebar Banner',
                'location': 'category_sidebar',
                'size': 'small',
                'color': '#ea580c',
                'text': 'Category\nSidebar'
            },
            {
                'title': 'Topic Page - Before Replies Banner',
                'location': 'topic_before_replies',
                'size': 'medium',
                'color': '#dc2626',
                'text': 'Before Replies\nBanner'
            },
            {
                'title': 'Topic Page - Sidebar Banner',
                'location': 'topic_sidebar',
                'size': 'small',
                'color': '#e11d48',
                'text': 'Topic\nSidebar'
            },
        ]

        self.stdout.write('Creating test banners...\n')

        for config in banner_configs:
            # Check if banner already exists for this location
            existing = None
            for banner in AdBanner.objects.all():
                if config['location'] in (banner.locations or []):
                    existing = banner
                    break
                    
            if existing:
                self.stdout.write(
                    self.style.WARNING(
                        f'⚠ Banner already exists for {config["location"]}: {existing.title}'
                    )
                )
                continue

            try:
                # Create image based on size
                size_dimensions = {
                    'small': (300, 120),
                    'medium': (728, 150),
                    'large': (970, 200),
                    'card': (300, 250),
                    'row': (728, 100),
                }
                
                width, height = size_dimensions.get(config['size'], (728, 90))
                
                # Create image
                img = Image.new('RGB', (width, height), color=config['color'])
                draw = ImageDraw.Draw(img)
                
                # Add text
                try:
                    # Try to use a better font
                    font = ImageFont.truetype("arial.ttf", 24)
                except:
                    # Fallback to default font
                    font = ImageFont.load_default()
                
                # Calculate text position (center)
                text = config['text']
                
                # Use textbbox for newer Pillow versions
                try:
                    bbox = draw.textbbox((0, 0), text, font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]
                except AttributeError:
                    # Fallback for older Pillow versions
                    text_width, text_height = draw.textsize(text, font=font)
                
                position = ((width - text_width) / 2, (height - text_height) / 2)
                
                # Draw text
                draw.text(position, text, fill='white', font=font, align='center')
                
                # Add banner label at top
                label = f"📢 {config['size'].upper()} BANNER"
                try:
                    label_bbox = draw.textbbox((0, 0), label, font=font)
                    label_width = label_bbox[2] - label_bbox[0]
                except AttributeError:
                    label_width, _ = draw.textsize(label, font=font)
                
                draw.text(((width - label_width) / 2, 10), label, fill='white', font=font)
                
                # Save to BytesIO
                img_io = BytesIO()
                img.save(img_io, format='PNG')
                img_io.seek(0)
                
                # Upload to Cloudinary
                self.stdout.write(f'Uploading image for {config["title"]}...')
                upload_result = upload(
                    img_io,
                    folder='banners',
                    public_id=f'banner_{config["location"]}',
                    overwrite=True
                )
                
                # Create banner
                banner = AdBanner.objects.create(
                    title=config['title'],
                    is_active=True,
                    image=upload_result['public_id'],
                    link_url='https://example.com',
                    alt_text=config['text'].replace('\n', ' '),
                    locations=[config['location']],
                    size=config['size']
                )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Created banner: {banner.title} (ID: {banner.id})'
                    )
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ Failed to create banner for {config["location"]}: {str(e)}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Done! Created banners for all available locations.'
            )
        )
        self.stdout.write('You can view them at: http://localhost:8000/admin/advertisements/adbanner/')
