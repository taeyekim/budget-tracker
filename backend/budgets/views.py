from rest_framework import generics, permissions
from .models import Budget
from .serializers import BudgetSerializer


class BudgetListCreateView(generics.ListCreateAPIView):
    """예산 목록 조회 및 생성"""
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        return queryset


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """예산 상세 조회, 수정, 삭제"""
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user) 