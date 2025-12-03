from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.core.management.base import BaseCommand

from pubcrawlmap.pubs.models import Pub

User = get_user_model()


class Command(BaseCommand):
    help = "Load sample pub data for São Paulo and create admin user"

    def handle(self, *args, **options):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin", email="admin@pubcrawl.com", password="admin123"
            )
            self.stdout.write(
                self.style.SUCCESS(
                    "Admin user created (username: admin, password: admin123)"
                )
            )
        else:
            self.stdout.write(self.style.WARNING("⚠ Admin user already exists"))

        sample_pubs = [
            {
                "name": "Cervejaria Nacional",
                "address": "Av. Paulista, 2073 - Consolação, São Paulo",
                "pub_type": "brewery",
                "rating": 4.5,
                "location": Point(-46.6563, -23.5558, srid=4326),
            },
            {
                "name": "Bar Brahma",
                "address": "Av. São João, 677 - Centro Histórico, São Paulo",
                "pub_type": "bar",
                "rating": 4.3,
                "location": Point(-46.6388, -23.5450, srid=4326),
            },
            {
                "name": "The Blue Pub",
                "address": "R. Pamplona, 1281 - Jardim Paulista, São Paulo",
                "pub_type": "pub",
                "rating": 4.6,
                "location": Point(-46.6612, -23.5677, srid=4326),
            },
            {
                "name": "O Escritório Bar",
                "address": "R. Augusta, 1416 - Consolação, São Paulo",
                "pub_type": "bar",
                "rating": 4.2,
                "location": Point(-46.6599, -23.5580, srid=4326),
            },
            {
                "name": "All Black Irish Pub",
                "address": "R. Amauri, 435 - Jardim Paulista, São Paulo",
                "pub_type": "pub",
                "rating": 4.4,
                "location": Point(-46.6700, -23.5730, srid=4326),
            },
            {
                "name": "SubAstor",
                "address": "R. Djalma Dutra, 75 - Sumaré, São Paulo",
                "pub_type": "cocktail_bar",
                "rating": 4.7,
                "location": Point(-46.6789, -23.5500, srid=4326),
            },
            {
                "name": "Empório Alto dos Pinheiros",
                "address": "R. Vupabussu, 271 - Pinheiros, São Paulo",
                "pub_type": "bar",
                "rating": 4.5,
                "location": Point(-46.7012, -23.5550, srid=4326),
            },
            {
                "name": "Brewdog Bar",
                "address": "R. Mourato Coelho, 1168 - Vila Madalena, São Paulo",
                "pub_type": "brewery",
                "rating": 4.6,
                "location": Point(-46.6920, -23.5570, srid=4326),
            },
            {
                "name": "Boteco São Bento",
                "address": "R. São Bento, 587 - Centro, São Paulo",
                "pub_type": "bar",
                "rating": 4.1,
                "location": Point(-46.6350, -23.5470, srid=4326),
            },
            {
                "name": "The Sailor Legendary Pub",
                "address": "Av. Angélica, 2503 - Consolação, São Paulo",
                "pub_type": "pub",
                "rating": 4.3,
                "location": Point(-46.6610, -23.5510, srid=4326),
            },
            {
                "name": "Cervejaria Seasons",
                "address": "R. Cônego Eugênio Leite, 1021 - Pinheiros, São Paulo",
                "pub_type": "brewery",
                "rating": 4.4,
                "location": Point(-46.6850, -23.5650, srid=4326),
            },
            {
                "name": "Bar da Dona Onça",
                "address": "Av. São João, 108 - Centro, São Paulo",
                "pub_type": "bar",
                "rating": 4.5,
                "location": Point(-46.6380, -23.5420, srid=4326),
            },
            {
                "name": "Lab Club",
                "address": "R. Fradique Coutinho, 1121 - Vila Madalena, São Paulo",
                "pub_type": "cocktail_bar",
                "rating": 4.6,
                "location": Point(-46.6900, -23.5590, srid=4326),
            },
            {
                "name": "Chopp da Fábrica",
                "address": "Av. Brigadeiro Faria Lima, 1541 - Jardim Paulistano, São Paulo",
                "pub_type": "brewery",
                "rating": 4.2,
                "location": Point(-46.6890, -23.5750, srid=4326),
            },
            {
                "name": "Caos Bar",
                "address": "R. Girassol, 67 - Vila Madalena, São Paulo",
                "pub_type": "bar",
                "rating": 4.3,
                "location": Point(-46.6880, -23.5560, srid=4326),
            },
        ]

        created_count = 0
        for pub_data in sample_pubs:
            pub, created = Pub.objects.get_or_create(
                name=pub_data["name"], defaults=pub_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"  ✓ Created: {pub.name}")
            else:
                self.stdout.write(f"  - Skipped: {pub.name} (already exists)")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nLoaded {created_count} new pubs out of {len(sample_pubs)} total"
            )
        )
