# Django მართვის ბრძანება ფორუმის ნიმუშური მონაცემებით შევსებისათვის (ქართული)
# ჩადით ამ ფაილს თქვენს აპში: <your_app>/management/commands/populate_forum.py
# გასაჩვეთი: python manage.py populate_forum

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from forum.models import Category, Topic, Reply, UserProfile


SAMPLE_CATEGORIES = [
    {"icon": "💬", "title": "ზოგადი",
        "description": "საერთო თემები, საზოგადოების საუბრები და გაცნობა."},
    {"icon": "🚘", "title": "ავტომობილების ბრენდები",
        "description": "საუბარი სხვადასხვა ავტომობილის ბრენდებზე და მოდელებზე."},
    {"icon": "🆕", "title": "ახალი მანქანები",
        "description": "ახალი ავტომობილების ბაზარი, ახალი მოდელები და მიმოხილვები."},
    {"icon": "♻️", "title": "მეორადი მანქანები / ბაზარი",
        "description": "მეორადი ავტომობილების ყიდვა/გაყიდვა, ინდექსები და რჩევები."},
    {"icon": "🚢", "title": "მანქანის იმპორტი",
        "description": "მანქანის შემოტანა სხვა ქვეყნიდან, პროცედურები და რჩევები."},
    {"icon": "🔧", "title": "ტექნიკური საკითხები",
        "description": "ავტომობილის პრობლემები, დიაგნოსტიკა და ტექნიკური დახმარება."},
    {"icon": "⚙️", "title": "ავტო დეტალები / ტიუნინგი",
        "description": "დეტალები, ტიუნინგი, მოდიფიკაციები და მოწყობილობები."},
    {"icon": "🛡️", "title": "ავტო დაზღვევა",
        "description": "დაზღვევის თემები, პირობები და რჩევები."},
    {"icon": "🚦", "title": "საგზაო წესები და ჯარიმები",
        "description": "საგზაო მოძრაობის წესები, ჯარიმები და სამართლებრივი საკითხები."},
    {"icon": "🚗", "title": "ავტო–ქირაობა და შერინგი",
        "description": "მანქანის გაქირავება, კარშერინგი და გამოცდილების გაზიარება."},
    {"icon": "⚡", "title": "EV & ჰიბრიდები",
        "description": "ელექტრომობილები, ჰიბრიდები და ეკო–ტრანსპორტი."},
    {"icon": "🛠️", "title": "მომსახურება / სერვისები",
        "description": "სერვის ცენტრები, რეკომენდაციები და მომსახურების გამოცდილება."},
]

SAMPLE_USERS = [
    {"username": "admin", "email": "admin@example.com",
        "password": "adminpass123", "is_staff": True, "is_superuser": True},
    {"username": "alice", "email": "alice@example.com", "password": "alicepass"},
    {"username": "bob", "email": "bob@example.com", "password": "bobpass"},
]

SAMPLE_TOPICS = [
    {
        "title": "რომელი ზეთი დავასხა ჩემი მანქანისთვის?",
        "content": "2.0 ბენზინი ვარ, 150,000 კმ გარბენით. 5W30 ჯობს თუ 5W40? ვინ რას იყენებს საქართველოში?",
        "category": "ტექნიკური საკითხები",
        "author": "alice",
    },
    {
        "title": "მანქანის შემოტანა ამერიკიდან — რომელ აუქციონს მივანიჭო უპირატესობა?",
        "content": "Copart თუ IAAI? ასევე მაინტერესებს ტრანსპორტირების და განბაჟების ხარჯები.",
        "category": "მანქანის იმპორტი",
        "author": "bob",
    },
    {
        "title": "მეორადის ყიდვა — რაზე მივაქციო ყურადღება?",
        "content": "ვაპირებ მეორადის შეძენას და მინდა ძირითადი რჩევები: გარბენი, ლაქები, ძრავი, ქარხნული შემოწმება?",
        "category": "მეორადი მანქანები / ბაზარი",
        "author": "admin",
    },
    {
        "title": "ელექტრომობილი თუ ბენზინი? გამოცდილება მჭირდება",
        "content": "ვფიქრობლ GTX-ზე ან Ioniq-ზე. ვინ არის EV-ზე მცხოვრები? ღირს საქართველოში?",
        "category": "EV & ჰიბრიდები",
        "author": "alice",
    },
    {
        "title": "საგზაო ჯარიმები — სად შევამოწმო?",
        "content": "არის ოფიციალური პლატფორმა где შემიძლია ჩემი ჯარიმები ვნახო?",
        "category": "საგზაო წესები და ჯარიმები",
        "author": "bob",
    },
    {
        "title": "ტურბოის დაყენება 2.5 მოტორზე — აზრი აქვს?",
        "content": "ვფიქრობ ტურბოს პროექტზე. როგორია გადასახადები, დეტალები და რეალური შედეგი?",
        "category": "ავტო დეტალები / ტიუნინგი",
        "author": "admin",
    },
    {
        "title": "Car-sharing საქართველოში — რომელი კომპანია ჯობს?",
        "content": "Bolt უჯობს City-Drive-ს თუ პირიქით? მომსახურება, ფასები, მანქანების მდგომარეობა?",
        "category": "ავტო–ქირაობა და შერინგი",
        "author": "bob",
    },
    {
        "title": "რომელი საბურავი ავარჩიო ზამთრისთვის?",
        "content": "Michelin თუ Bridgestone? ან იქნებ Kumho/Hankook ჯობია თანხის მისამართით?",
        "category": "ავტომობილების ბრენდები",
        "author": "alice",
    },
]


SAMPLE_REPLIES = [
    {"topic_title": "რომელი ზეთი დავასხა ჩემი მანქანისთვის?", "author": "bob",
     "content": "თუ გარბენი მაღალია, 5W40 უკეთესია. Liqui Moly ვიყენებ უკვე 3 წელია."},

    {"topic_title": "რომელი ზეთი დავასხა ჩემი მანქანისთვის?", "author": "admin",
     "content": "ნახე მწარმოებლის რეკომენდაცია პირველად, მერე გადაწყვიტე. API/ACEA კლასიც მნიშვნელოვანია."},

    {"topic_title": "მანქანის შემოტანა ამერიკიდან — რომელ აუქციონს მივანიჭო უპირატესობა?", "author": "alice",
     "content": "Copart მეტი არჩევანია, მაგრამ IAA-ში ზოგჯერ უფრო სუფთა მანქანები დგას."},

    {"topic_title": "მეორადის ყიდვა — რაზე მივაქციო ყურადღება?", "author": "bob",
     "content": "OBD სკანერი აუცილებლად! და ძარის ნაწილები gaps-ზე გადაამოწმე."},

    {"topic_title": "ელექტრომობილი თუ ბენზინი? გამოცდილება მჭირდება", "author": "admin",
     "content": "თუ ქალაქში ცხოვრობ და გაქვს ჩარტვის საშუალება — EV აზრიანი ვარიანტია."},

    {"topic_title": "საგზაო ჯარიმები — სად შევამოწმო?", "author": "alice",
     "content": "mcs.gov.ge — ოფიციალური პლატფორმაა, ID-ით შედი."},

    {"topic_title": "ტურბოის დაყენება 2.5 მოტორზე — აზრი აქვს?", "author": "bob",
     "content": "ინვესტიცია დიდი იქნება, ECU-ს რემაპი გჭირდება და კარგი cooler."},

    {"topic_title": "Car-sharing საქართველოში — რომელი კომპანია ჯობს?", "author": "admin",
     "content": "CityDrive-ს მანქანები უკეთიანია, Bolt იაფია ხანდახან."},

    {"topic_title": "რომელი საბურავი ავარჩიო ზამთრისთვის?", "author": "bob",
     "content": "Kumho Performance ზამთარში ცუდი არაა, მაგრამ Michelin საუკეთესოა."},
]


class Command(BaseCommand):
    help = 'ფორუმის ნიმუშური მონაცემებით შევსება (ქართული)'

    def handle(self, *args, **options):
        with transaction.atomic():
            # მომხმარებლების შექმნა
            users = {}
            for u in SAMPLE_USERS:
                obj, created = User.objects.get_or_create(username=u['username'], defaults={
                    'email': u['email'],
                    'is_staff': u.get('is_staff', False),
                    'is_superuser': u.get('is_superuser', False),
                })
                if created:
                    obj.set_password(u['password'])
                    obj.save()
                users[u['username']] = obj

                # პროფილის შექმნა ან განახლება
                profile, _ = UserProfile.objects.get_or_create(user=obj)
                
                profile.points = profile.points or 0
                profile.save()

            # კატეგორიების შექმნა
            categories = {}
            for c in SAMPLE_CATEGORIES:
                cat, _ = Category.objects.get_or_create(title=c['title'], defaults={
                    'icon': c['icon'],
                    'description': c['description'],
                })
                categories[c['title']] = cat

            # თოქპიკების შექმნა
            topics = {}
            for t in SAMPLE_TOPICS:
                author = users.get(t['author'])
                category = categories.get(t['category'])
                topic, _ = Topic.objects.get_or_create(
                    title=t['title'],
                    defaults={
                        'author': author,
                        'category': category,
                        'content': t['content'],
                    }
                )
                topics[t['title']] = topic

            # პასუხების შექმნა
            for r in SAMPLE_REPLIES:
                topic = topics.get(r['topic_title'])
                author = users.get(r['author'])
                if topic and author:
                    Reply.objects.get_or_create(
                        topic=topic, author=author, content=r['content'])

        self.stdout.write(self.style.SUCCESS(
            'ფორუმი წარმატებით შევსდა ნიმუშური მონაცემებით (ქართული).'))
