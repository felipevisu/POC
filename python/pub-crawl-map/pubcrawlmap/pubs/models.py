from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class Pub(models.Model):
    PUB_TYPE_CHOICES = [
        ("pub", "Pub"),
        ("bar", "Bar"),
        ("brewery", "Brewery"),
        ("cocktail_bar", "Cocktail Bar"),
        ("wine_bar", "Wine Bar"),
    ]

    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pub_type = models.CharField(max_length=20, choices=PUB_TYPE_CHOICES, default="pub")
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        null=True,
        blank=True,
    )
    location = models.PointField(srid=4326)

    class Meta:
        indexes = [
            models.Index(fields=["location"]),
            models.Index(fields=["pub_type"]),
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def latitude(self):
        return self.location.y

    @property
    def longitude(self):
        return self.location.x
