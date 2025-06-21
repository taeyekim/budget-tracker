from django.db import models
from django.conf import settings


class Category(models.Model):
    """거래 카테고리"""
    CATEGORY_TYPES = [
        ('income', '수입'),
        ('expense', '지출'),
    ]
    
    name = models.CharField(max_length=50, verbose_name="카테고리명")
    type = models.CharField(max_length=10, choices=CATEGORY_TYPES, verbose_name="타입")
    color = models.CharField(max_length=7, default="#3B82F6", help_text="Hex 색상 코드")
    icon = models.CharField(max_length=50, blank=True, help_text="아이콘 클래스명")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "카테고리"
        verbose_name_plural = "카테고리"
        unique_together = ['name', 'user', 'type']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Transaction(models.Model):
    """거래 내역"""
    TRANSACTION_TYPES = [
        ('income', '수입'),
        ('expense', '지출'),
    ]

    title = models.CharField(max_length=200, verbose_name="제목")
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="금액")
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, verbose_name="타입")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='transactions')
    description = models.TextField(blank=True, verbose_name="설명")
    date = models.DateField(verbose_name="날짜")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "거래 내역"
        verbose_name_plural = "거래 내역"
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.amount}원"

    def save(self, *args, **kwargs):
        # 카테고리 타입과 거래 타입이 일치하는지 확인
        if self.category.type != self.type:
            raise ValueError("카테고리 타입과 거래 타입이 일치하지 않습니다.")
        super().save(*args, **kwargs) 