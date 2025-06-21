from django.contrib import admin
from .models import Category, Transaction


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """카테고리 관리자"""
    list_display = ('name', 'type', 'user', 'color', 'transaction_count', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('name', 'user__email')
    readonly_fields = ('created_at',)
    
    def transaction_count(self, obj):
        """해당 카테고리의 거래 개수"""
        return obj.transactions.count()
    transaction_count.short_description = '거래 개수'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """거래 내역 관리자"""
    list_display = ('title', 'amount', 'type', 'category', 'user', 'date', 'created_at')
    list_filter = ('type', 'category', 'date', 'created_at')
    search_fields = ('title', 'description', 'user__email')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('title', 'amount', 'type', 'category', 'description', 'date')
        }),
        ('사용자 정보', {
            'fields': ('user',)
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 