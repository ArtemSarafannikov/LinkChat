from django.shortcuts import render
from django.http import JsonResponse
from .models import Message


def message_history(request):
    messages = Message.objects.order_by('-timestamp')[:50]  # последние 50 сообщений
    messages_data = [
        {"username": message.username, "text": message.text, "timestamp": message.timestamp.isoformat()}
        for message in messages
    ]
    return JsonResponse(messages_data, safe=False)


def index(request):
    return render(request, 'index.html')
