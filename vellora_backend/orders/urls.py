from django.urls import path
from . import views



urlpatterns = [
    path('place/', views.place_order, name='place_order'),
]