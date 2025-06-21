from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('user/', views.UserProfileView.as_view(), name='user-profile'),
    path('change-password/', views.change_password, name='change-password'),
] 