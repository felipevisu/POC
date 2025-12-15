from rest_framework import status
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ContactSerializer


class ContactFormView(APIView):
    """
    Contact Form API

    Submit your contact information and message through this form.
    All submissions will be logged to the console.
    """

    renderer_classes = [TemplateHTMLRenderer, JSONRenderer]
    template_name = "contact_form.html"

    def get(self, request):
        """Display the contact form"""
        serializer = ContactSerializer()
        return Response({"serializer": serializer})

    def post(self, request):
        serializer = ContactSerializer(data=request.data)

        if serializer.is_valid():
            # Print form data to console
            print("=" * 50)
            print("CONTACT FORM SUBMISSION")
            print("=" * 50)
            print(f"Name: {serializer.validated_data['name']}")
            print(f"Email: {serializer.validated_data['email']}")
            print(f"Subject: {serializer.validated_data['subject']}")
            print(f"Message: {serializer.validated_data['message']}")
            print("=" * 50)

            # Redirect back to form with success message for HTML requests
            if request.accepted_renderer.format == "html":
                return Response(
                    {"serializer": serializer, "success": True},
                    template_name="contact_success.html",
                )

            return Response(
                {"message": "Contact form received successfully!"},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
