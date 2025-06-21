from django.db import models
from django.conf import settings
from transactions.models import Category


class Budget(models.Model):
    """예산 모델"""
    PERIOD_CHOICES = [
        ('monthly', '월별'),
        ('yearly', '연별'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="예산명")
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="예산액")
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='monthly', verbose_name="기간")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    start_date = models.DateField(verbose_name="시작일")
    end_date = models.DateField(verbose_name="종료일")
    is_active = models.BooleanField(default=True, verbose_name="활성화")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "예산"
        verbose_name_plural = "예산"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.amount}원"

    @property
    def spent_amount(self):
        """해당 예산 기간 동안 사용된 금액"""
        from transactions.models import Transaction
        
        transactions = Transaction.objects.filter(
            user=self.user,
            type='expense',
            date__gte=self.start_date,
            date__lte=self.end_date
        )
        
        if self.category:
            transactions = transactions.filter(category=self.category)
        
        return transactions.aggregate(total=models.Sum('amount'))['total'] or 0

    @property
    def remaining_amount(self):
        """남은 예산 금액"""
        return self.amount - self.spent_amount

    @property
    def usage_percentage(self):
        """예산 사용률 (백분율)"""
        if self.amount == 0:
            return 0
        return (self.spent_amount / self.amount) * 100 