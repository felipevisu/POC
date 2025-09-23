from django_elasticsearch_dsl import Document, Index, fields
from django_elasticsearch_dsl.registries import registry

from .models import Book

book_index = Index("books")
book_index.settings(
    number_of_shards=1,
    number_of_replicas=0
)

@registry.register_document
class BookDocument(Document):
    title = fields.TextField(
        fields={"raw": fields.KeywordField()}
    )
    author = fields.TextField(
        fields={"raw": fields.KeywordField()}
    )
    description = fields.TextField()

    class Index:
        name = "books"

    class Django:
        model = Book
        fields = ["id", "year"]