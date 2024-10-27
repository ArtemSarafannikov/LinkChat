from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
path('history/', views.message_history, name='message_history'),
]