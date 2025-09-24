from django_opensearch_dsl import Document, fields
from django_opensearch_dsl.registries import registry

from .models import Book


@registry.register_document
class BookDocument(Document):
    """Book OpenSearch document."""

    title = fields.TextField(
        analyzer='standard',
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
        }
    )

    author = fields.TextField(
        analyzer='standard',
        fields={
            'raw': fields.KeywordField(),
        }
    )

    year = fields.IntegerField()
    description = fields.TextField(analyzer='standard')

    class Index:
        name = 'books'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = Book
        fields = ['id']