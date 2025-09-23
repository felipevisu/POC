from rest_framework.views import APIView
from rest_framework.response import Response
from .documents import BookDocument

class BookSearchView(APIView):
    def get(self, request):
        q = request.query_params.get("q", "")
        search = BookDocument.search().query(
            "multi_match", query=q, fields=["title", "author", "description"]
        )
        response = search.execute()
        return Response([
            {
                "id": hit.id,
                "title": hit.title,
                "author": hit.author,
                "year": hit.year,
                "description": hit.description,
            }
            for hit in response
        ])
