from rest_framework import serializers


class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=100, help_text="Enter your full name", label="Full Name"
    )
    email = serializers.EmailField(
        help_text="We'll never share your email with anyone else", label="Email Address"
    )
    subject = serializers.CharField(
        max_length=200, help_text="Brief subject of your message", label="Subject"
    )
    message = serializers.CharField(
        style={"base_template": "textarea.html", "rows": 5},
        help_text="Please provide detailed information about your inquiry",
        label="Message",
    )
