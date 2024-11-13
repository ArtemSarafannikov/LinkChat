from django.urls import path
from . import views

urlpatterns = [
    path('<int:chat_id>/', views.index, name='index'),
    path('history/<int:chat_id>/', views.message_history, name='message_history'),
]