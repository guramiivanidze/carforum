from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import register, login, logout, get_current_user

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('me/', get_current_user, name='current-user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
