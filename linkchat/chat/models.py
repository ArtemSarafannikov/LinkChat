from django.db import models
from django.contrib.auth.models import User


class Chat(models.Model):
    name = models.CharField(max_length=255)
    patricipants = models.ManyToManyField(User, related_name="chats")

    def __str__(self):
        return self.name


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages", default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages", default=0)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username}: {self.text} at {self.timestamp}"
