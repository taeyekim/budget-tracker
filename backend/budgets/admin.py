from django.contrib import admin
from .models import Budget


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    """예산 관리자"""
    list_display = ('name', 'amount', 'period', 'category', 'user', 'usage_percentage', 'is_active', 'start_date', 'end_date')
    list_filter = ('period', 'is_active', 'start_date', 'created_at')
    search_fields = ('name', 'user__email', 'category__name')
    readonly_fields = ('created_at', 'updated_at', 'spent_amount', 'remaining_amount', 'usage_percentage')
    
    fieldsets = (
        (None, {
            'fields': ('name', 'amount', 'period', 'category', 'start_date', 'end_date', 'is_active')
        }),
        ('사용자 정보', {
            'fields': ('user',)
        }),
        ('통계 정보', {
            'fields': ('spent_amount', 'remaining_amount', 'usage_percentage'),
            'classes': ('collapse',)
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def usage_percentage(self, obj):
        """예산 사용률"""
        return f"{obj.usage_percentage:.1f}%"
    usage_percentage.short_description = '사용률' 