from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import Message, Chat


def message_history(request, chat_id):
    messages = Message.objects.filter(chat_id=chat_id).order_by('-timestamp')[:50]  # последние 50 сообщений
    messages_data = []
    for message in messages:
        messages_data.append(
            {
                "username": message.user.username,
                "text": message.text,
                "timestamp": message.timestamp.isoformat()
            }
        )
    return JsonResponse(messages_data, safe=False)


@login_required
def index(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        return render(request, '404.html')
    return render(request, 'index.html', { 'chat': chat })
