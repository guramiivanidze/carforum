from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from forum.models import Category, Topic, Reply, UserProfile
from django.utils import timezone


class Command(BaseCommand):
    help = 'Populate database with sample forum data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting data population...'))

        # ✅ Create category if not exists
        category, created = Category.objects.get_or_create(
            title="EV & ჰიბრიდები",
            defaults={
                "icon": "⚡",
                "description": "ელექტრო და ჰიბრიდული ავტომობილების განხილვა"
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(
                f'Created category: {category.title}'))
        else:
            self.stdout.write(f'Category already exists: {category.title}')

        # ✅ Demo users if not exist
        users = []
        usernames = ["evfan", "tesla_master",
                     "prius_guru", "nissanleaf", "hybridlover"]
        for name in usernames:
            user, created = User.objects.get_or_create(
                username=name,
                defaults={
                    "email": f"{name}@example.com"
                }
            )
            if created:
                user.set_password("pass1234")
                user.save()
                # Create user profile
                UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "points": 10
                    }
                )
                self.stdout.write(self.style.SUCCESS(f'Created user: {name}'))
            users.append(user)

        topics_data = [
            ("2025 Tesla Model 3 Highland – ღირს ყიდვა?", """
ახალ Model 3 Highland-ზე ბევრი კარგი კომენტარი წავიკითხე.
სამგზავრო კომფორტი გაუმჯობესებულია, ბატარეა უფრო გამძლეა, სალონის იზოლაციაც უკეთესია.

ვიცი რომ საქართველოში Tesla-ს სერვისი არაა ოფიციალურად, მაგრამ ნაწილები და მომსახურება რამდენად ხელმისაწვდომია?
"""),

            ("Toyota Prius 2024 – რეალური მოხმარება", """
ახალი Prius აშკარად ყველას აოცებს დიზაინით და ეკონომიით.
ვინც ფლობთ, რეალურად რამდენს ახარჯავს ქალაქში/გზაზე?
Hybrid system იწყებს ძრავის ჩართვას ცივ ამინდში?
"""),

            ("Hyundai Ioniq 5 vs Kia EV6 – რომელი ჯობია?", """
ორივე მოდელი ჩემი ფავორიტია, მაგრამ მაინტერესებს დატენვის სიჩქარე, რეალური range და საკომფორტო მგზავრობა.
Georgia–ში რომელ მოდელზე უფრო მარტივია ნაწილების შოვნა?
"""),

            ("Nissan Leaf 40 kWh BMS და ბატარეის დეგრადაცია", """
Leaf 40 kWh მოდელზე ბევრს უთქვამს BMS–ის პრობლემებზე.
თუ 2020 წლის Leaf-ს ვიყიდი, რა უნდა შევამოწმო?
RapidGate პრობლემა ისევ აქვს?
"""),

            ("Plug-in Hybrid vs Full EV – საქართველო?", """
ჩვენს ქვეყანაში რა ჯობია? Plug-in Hybrid თუ სრულად ელექტრო?
ქუჩაში ყველა ამბობს რომ PHEV იდეალურია ჯამრთელობისთვის და ქალაქისთვის, მაგრამ მართლა ასეა?
"""),

            ("Tesla Powerwall და Solar roof საქართველოში", """
არის ვინმე ვისაც უკვე აქვს მზის პანელები და Powerwall?
რამდენად ამართლებს?
"""),

            ("შენახვა ზამთარში – ბატარეის მოვლა", """
როგორ ვიცავ ბატარეას თოვლის დროს? უნდა დავტენო 20-80%?
"""),

            ("Hybrid brake booster problem – Toyota CH-R", """
Toyota CH-R Hybrid – ზოგჯერ ბრეკი მკვრივდება. ხომ არ გქონიათ მსგავსი?
"""),

            ("BMW i3 Rex ღირს თუ არა?", """
Range-extender BMW i3 რამდენად პრობლემურია საქართველოში?
"""),

            ("BYD Seal vs Tesla Model 3", """
BYD ახალ მოდელებს როგორ აფასებთ? Tesla-ს რეალური კონკურენტი გახდა?
"""), ("Tesla Supercharger ქსელი საქართველოში – როდის იქნება?", """
ვრცელდება ჭોરები რომ Supercharger ქსელი შეიძლება გაიხსნას საქართველოში.
ვინმემ იცით რამე დაზუსტებული ინფორმაცია?
"""),

            ("Toyota Camry Hybrid 2023 გამოცდილება", """
Camry Hybrid ახალ თაობაზე როგორია რეალურად?
ზამთარში რა расходი აქვს თბილისში?
"""),

            ("EV ბატარეის შეცვლა საქართველოში – ფასები და გამოცდილება", """
ვინც შეცვალეთ ბატარეა, რამდენი დაგიჯდათ და სად გააკეთეთ?
არის სანდო სერვისები?
"""),

            ("Hyundai Kona Electric – რეალური range ტესტი", """
Kona Electric-ის მფლობელებო,
ზაფხულში და ზამთარში საშუალოდ რამდენ კმ გადის?
"""),

            ("Plug-in Hybrid დატენვა სახლში – რა infrastructuere სჭირდება?", """
PHEV მფლობელებო,
სახლში რომ იტენით, რა ჩამონტაჟება დაგჭირდათ? 
ერთ phase-ზე საკმარისია?
"""),

            ("EV Tax / საბაჟო შეღავათები – რა ხდება 2025 წელს?", """
ხვდება თუ არა EV-ებზე საქართველოში ახალი საბაჟო შეღავათები?
ვრცელდება 2025 წლიდან რამე ცვლილება?
"""),

            ("Tesla Model Y გარემონტებული ბატარეით – ღირს თუ არა?", """
არსებობს ბევრი Model Y გარემონტებული battery pack-ით.
საიდან ვიცოდე კარგია თუ არა? Worth it?
"""),

            ("Lexus UX250h Hybrid – აზრი აქვს ყიდვას?", """
UX250h–ზე ბევრს უყვარს, მაგრამ დინამიკა სუსტია.
Hybrid ეკონომია ნორმალურია?
"""),

            ("Mitsubishi Outlander PHEV – რეალური მოხმარება", """
Outlander PHEV მფლობელებო,
EV რეჟიმში რამდენს გადის თბილისში საცობებში?
"""),

            ("EV Charging Etiquette საქართველოში", """
საჯარო დამტენზე ხშირად მანქანებს ტოვებენ სრულ დატენვის შემდეგ.
უნდა იყოს ჯარიმა ან time-limit? თქვენი აზრი?
"""),

            ("Nissan e-Power სისტემა – Hybrid თუ რა არის?", """
Nissan e-Power ბევრს ერევა. 
Hybrid არის თუ range-extender? 
ვინმემ იყიდა და როგორია?
"""),

            ("Tesla Autopilot საქართველოში – რეალურად მუშაობს?", """
Autopilot და FSD საქართველოში რეალურად მუშაობს?
Navigate on Highway მუშაობს?
"""),

            ("Kia Niro EV / Hybrid – რომელს ურჩევთ?", """
Niro EV vs Niro Hybrid – რომელი ჯობია საქართველოს პირობებში?
"""),

            ("Charging app-ები საქართველოში – რომელი უკეთესია?", """
EV მძღოლებო, რომელი აპი გამოიყენება დამტენების საპოვნად საქართველოში?
PlugShare? EVWay? სხვა?
"""),

            ("EV ბატარეის გაბერვა/დეფორმაცია – ნიშნები", """
როგორ შევამჩნიო თუ ბატარეა დეფორმირდება ან swell აქვს?
არის ვინმეს გამოცდილება?
"""),

            ("Honda Insight Hybrid – ღირს თუ არა შეძენა?", """
Insight Hybrid იშვიათია საქართველოში.
ნაწილები და ბატარეა ხელმისაწვდომია?
"""),

            ("Google Maps EV Routing – მუშაობს?", """
Google Maps-ში EV routing და charging stops გამოჩნდა.
საქართველოში მუშაობს სწორად?
"""),

            ("Solar charger for EV – რეალურად მუშაობს?", """
არის ლაპარაკი რომ შესაძლებელია მზის პანელებით EV დატენვა.
ვინმეს გაქვთ პრაქტიკული ניסיון?
"""),

            ("Tesla Model S 85 ბატარეის დეგრადაცია", """
Model S 85-ების მეპატრონეები,
რამდენ პროცენტზე გაქვთ degradation წლების შემდეგ?
"""),

            ("BMW X5 45e vs Mercedes GLE 350e – Hybrid შედარება", """
ორივე Premium Plug-in Hybrid. 
რომელი ჯობია რეალურ ცხოვრებაში?
სერვისი/ნაწილები საქართველოში?
""")
        ]

        # ✅ Create topics & replies
        topics_created = 0
        replies_created = 0

        for title, content in topics_data:
            # Check if topic already exists
            if Topic.objects.filter(title=title).exists():
                self.stdout.write(f'Topic already exists: {title[:50]}...')
                continue

            topic = Topic.objects.create(
                title=title,
                content=content,
                author=users[0],
                category=category
            )
            topics_created += 1

            # Auto add sample replies
            sample_replies = [
                "ძალიან საინტერესო კითხვაა, მეც მაინტერესებს.",
                "მე ვფლობ და ძალიან კმაყოფილი ვარ!",
                "Georgia-ში ნაწილები ადვილად იშოვება, სულ პრობლემა არაა.",
                "Range ზამთარში ნამდვილად იკლებს, მაგრამ არა დრამატულად.",
            ]

            for i, text in enumerate(sample_replies):
                Reply.objects.create(
                    topic=topic,
                    author=users[(i % len(users))],
                    content=text
                )
                replies_created += 1

        self.stdout.write(self.style.SUCCESS(f'\n✅ Data population complete!'))
        self.stdout.write(self.style.SUCCESS(
            f'Topics created: {topics_created}'))
        self.stdout.write(self.style.SUCCESS(
            f'Replies created: {replies_created}'))
