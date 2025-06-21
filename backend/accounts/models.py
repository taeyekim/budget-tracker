from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """커스텀 사용자 모델"""
    email = models.EmailField(unique=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Profile(models.Model):
    """사용자 프로필 확장 정보"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="월 예산")
    currency = models.CharField(max_length=3, default='KRW', help_text="통화")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} 프로필" 