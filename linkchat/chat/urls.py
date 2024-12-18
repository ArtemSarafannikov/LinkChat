from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat, name='chat'),
    path('history/<int:chat_id>/', views.message_history, name='message_history'),
    path('get_chats/', views.get_chats, name='get_chats'),
    path('audio/<str:filename>/', views.stream_audio, name='stream_audio'),
    path('test_audio/', views.test_audio, name='test_audio'),
]