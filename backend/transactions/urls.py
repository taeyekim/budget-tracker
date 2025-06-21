from django.urls import path
from . import views

urlpatterns = [
    # 카테고리 관련 URL
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('categories/create-defaults/', views.create_default_categories, name='create-default-categories'),
    
    # 거래 내역 관련 URL
    path('transactions/', views.TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    
    # 통계 관련 URL
    path('stats/', views.transaction_stats, name='transaction-stats'),
] 