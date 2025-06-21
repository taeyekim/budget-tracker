from django.urls import path
from . import views

urlpatterns = [
    path('budgets/', views.BudgetListCreateView.as_view(), name='budget-list-create'),
    path('budgets/<int:pk>/', views.BudgetDetailView.as_view(), name='budget-detail'),
] 