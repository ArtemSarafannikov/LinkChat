from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, FileResponse, Http404
from django.conf import settings
from django.contrib.auth.models import User
from googletrans import Translator
from .models import Message, Chat
import os.path

@login_required
def message_history(request, chat_id):
    user_id = request.user.id
    exists = Chat.objects.filter(id=chat_id, patricipants=request.user).exists()
    if not exists:
        return JsonResponse({})

    messages = Message.objects.filter(chat_id=chat_id).order_by('-timestamp')[::-1]
    messages_data = []
    language = request.GET.get('language', 'original')

    translator = Translator()

    for message in messages:
        message_text = message.text
        if language != 'original':
            try:
                message_text = translator.translate(message.text, dest=language).text
            except Exception as e:
                print(e)
        messages_data.append(
            {
                "msg_type": "sent" if request.user.id == message.user_id else "received",
                "text": message_text,
                "timestamp": message.timestamp.strftime("%H:%M")
            }
        )
    return JsonResponse(messages_data, safe=False)


def stream_audio(request, filename):
    file_path = os.path.join(settings.MEDIA_ROOT, 'audio', filename)
    if not os.path.exists(file_path):
        raise Http404(f"File {filename} not found")

    response = FileResponse(open(file_path, 'rb'), content_type='audio/mpeg')
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    return response


@login_required
def get_chats(request):
    chats_data = Chat.objects.filter(patricipants=request.user).values('id', 'name')
    return JsonResponse(list(chats_data), safe=False)


@login_required
def chat(request):
    return render(request, 'chat.html')


def test_audio(request):
    return render(request, 'audio.html')
