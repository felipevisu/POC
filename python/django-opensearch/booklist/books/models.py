from django.db import models


class Book(models.Model):
    title: str = models.CharField(max_length=255)
    author: str = models.CharField(max_length=255)
    year: int = models.IntegerField()
    description: str = models.TextField()