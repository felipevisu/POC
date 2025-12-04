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
            # Rio de Janeiro Pubs
            {
                "name": "Belmonte",
                "address": "Praia de Copacabana, 1.181 - Copacabana, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.4,
                "location": Point(-43.1850, -22.9700, srid=4326),
            },
            {
                "name": "Cervantes",
                "address": "R. Prado Júnior, 335 - Copacabana, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.5,
                "location": Point(-43.1820, -22.9680, srid=4326),
            },
            {
                "name": "Devassa",
                "address": "Av. General San Martin, 1.241 - Leblon, Rio de Janeiro",
                "pub_type": "brewery",
                "rating": 4.3,
                "location": Point(-43.2240, -22.9840, srid=4326),
            },
            {
                "name": "Bar do Adão",
                "address": "R. Dias Ferreira, 214 - Leblon, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.6,
                "location": Point(-43.2210, -22.9830, srid=4326),
            },
            {
                "name": "The Lord",
                "address": "Av. Armando Lombardi, 800 - Barra da Tijuca, Rio de Janeiro",
                "pub_type": "pub",
                "rating": 4.4,
                "location": Point(-43.3050, -23.0100, srid=4326),
            },
            {
                "name": "Bracarense",
                "address": "R. José Linhares, 85 - Leblon, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.5,
                "location": Point(-43.2220, -22.9850, srid=4326),
            },
            {
                "name": "Bip Bip",
                "address": "R. Almirante Gonçalves, 50 - Copacabana, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.7,
                "location": Point(-43.1800, -22.9660, srid=4326),
            },
            {
                "name": "Academia da Cachaça",
                "address": "R. Conde de Bernadotte, 26 - Leblon, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.4,
                "location": Point(-43.2250, -22.9860, srid=4326),
            },
            {
                "name": "Jobi",
                "address": "Av. Ataulfo de Paiva, 1.166 - Leblon, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.3,
                "location": Point(-43.2200, -22.9820, srid=4326),
            },
            {
                "name": "Boteco Belmonte Lapa",
                "address": "R. do Lavradio, 60 - Lapa, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.2,
                "location": Point(-43.1800, -22.9130, srid=4326),
            },
            {
                "name": "Bakers Leblon",
                "address": "R. Dias Ferreira, 147 - Leblon, Rio de Janeiro",
                "pub_type": "pub",
                "rating": 4.5,
                "location": Point(-43.2215, -22.9835, srid=4326),
            },
            {
                "name": "Maze Inn",
                "address": "R. Tavares Bastos, 414 - Catete, Rio de Janeiro",
                "pub_type": "cocktail_bar",
                "rating": 4.6,
                "location": Point(-43.1780, -22.9250, srid=4326),
            },
            {
                "name": "Bar do Mineiro",
                "address": "R. Paschoal Carlos Magno, 99 - Santa Teresa, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.5,
                "location": Point(-43.1870, -22.9170, srid=4326),
            },
            {
                "name": "Astor",
                "address": "R. Duvivier, 37 - Copacabana, Rio de Janeiro",
                "pub_type": "cocktail_bar",
                "rating": 4.6,
                "location": Point(-43.1790, -22.9640, srid=4326),
            },
            {
                "name": "Shenanigan's Irish Pub",
                "address": "R. Visconde de Pirajá, 112 - Ipanema, Rio de Janeiro",
                "pub_type": "pub",
                "rating": 4.3,
                "location": Point(-43.2070, -22.9840, srid=4326),
            },
            {
                "name": "Champanharia Ovelha Negra",
                "address": "R. Barão da Torre, 534 - Ipanema, Rio de Janeiro",
                "pub_type": "wine_bar",
                "rating": 4.5,
                "location": Point(-43.2100, -22.9870, srid=4326),
            },
            {
                "name": "00 (Zero Zero)",
                "address": "Av. Padre Leonel Franca, 240 - Gávea, Rio de Janeiro",
                "pub_type": "cocktail_bar",
                "rating": 4.7,
                "location": Point(-43.2310, -22.9790, srid=4326),
            },
            {
                "name": "Brasserie da Gávea",
                "address": "Praça Santos Dumont, 116 - Gávea, Rio de Janeiro",
                "pub_type": "brewery",
                "rating": 4.4,
                "location": Point(-43.2280, -22.9800, srid=4326),
            },
            {
                "name": "Bar Lagoa",
                "address": "Av. Epitácio Pessoa, 1.674 - Lagoa, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.2,
                "location": Point(-43.2050, -22.9720, srid=4326),
            },
            {
                "name": "Palaphita Kitch",
                "address": "Av. Epitácio Pessoa - Lagoa, Rio de Janeiro",
                "pub_type": "bar",
                "rating": 4.4,
                "location": Point(-43.2100, -22.9750, srid=4326),
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
