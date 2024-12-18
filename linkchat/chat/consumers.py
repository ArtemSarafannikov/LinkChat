# chat/consumers.py
import json

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        user = self.scope["user"]
        if user.is_authenticated:
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        chat_id = data['chat_id']

        user = self.scope["user"]
        await self.save_message(user.id, chat_id, message)

        # Отправляем сообщение группе
        # user = User.objects.get(id=user_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.channel_name
            }
        )

        await self.send(json.dumps({
            'text': message,
            'msg_type': 'sent'
        }))

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        if self.channel_name != sender:
            await self.send(text_data=json.dumps({
                'text': message,
                'msg_type': 'received'
            }))

    @sync_to_async
    def save_message(self, user_id, chat_id, message):
        from .models import Message, Chat
        from django.contrib.auth.models import User

        chat = Chat.objects.get(id=chat_id)
        user = User.objects.get(id=user_id)
        Message.objects.create(user=user, text=message, chat=chat)

