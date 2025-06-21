from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from datetime import datetime, date
from decimal import Decimal
from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer, TransactionStatsSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    """카테고리 목록 조회 및 생성"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Category.objects.filter(user=self.request.user)
        category_type = self.request.query_params.get('type', None)
        if category_type:
            queryset = queryset.filter(type=category_type)
        return queryset


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """카테고리 상세 조회, 수정, 삭제"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)


class TransactionListCreateView(generics.ListCreateAPIView):
    """거래 내역 목록 조회 및 생성"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        
        # 필터링 옵션들
        transaction_type = self.request.query_params.get('type', None)
        category_id = self.request.query_params.get('category', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        search = self.request.query_params.get('search', None)

        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )

        return queryset.select_related('category')


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """거래 내역 상세 조회, 수정, 삭제"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transaction_stats(request):
    """거래 통계 조회"""
    user = request.user
    
    # 날짜 필터링
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    # 기본값: 현재 월
    if not start_date or not end_date:
        today = date.today()
        start_date = today.replace(day=1)
        end_date = today
    
    transactions = Transaction.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date
    )
    
    # 기본 통계
    income_sum = transactions.filter(type='income').aggregate(
        total=Sum('amount')
    )['total'] or Decimal('0')
    
    expense_sum = transactions.filter(type='expense').aggregate(
        total=Sum('amount')
    )['total'] or Decimal('0')
    
    balance = income_sum - expense_sum
    transaction_count = transactions.count()
    
    # 카테고리별 통계
    category_stats = transactions.values(
        'category__name', 'category__color', 'category__type'
    ).annotate(
        total=Sum('amount'),
        count=Count('id')
    ).order_by('-total')
    
    # 월별 통계 (최근 12개월)
    monthly_stats = transactions.annotate(
        month=TruncMonth('date')
    ).values('month').annotate(
        income=Sum('amount', filter=Q(type='income')),
        expense=Sum('amount', filter=Q(type='expense'))
    ).order_by('month')
    
    # 월별 통계 데이터 정리
    monthly_data = []
    for stat in monthly_stats:
        monthly_data.append({
            'month': stat['month'].strftime('%Y-%m'),
            'income': stat['income'] or 0,
            'expense': stat['expense'] or 0,
            'balance': (stat['income'] or 0) - (stat['expense'] or 0)
        })
    
    stats_data = {
        'total_income': income_sum,
        'total_expense': expense_sum,
        'balance': balance,
        'transaction_count': transaction_count,
        'category_stats': list(category_stats),
        'monthly_stats': monthly_data
    }
    
    serializer = TransactionStatsSerializer(stats_data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_default_categories(request):
    """기본 카테고리 생성"""
    user = request.user
    
    # 기본 수입 카테고리들
    income_categories = [
        {'name': '급여', 'color': '#10B981', 'icon': 'money'},
        {'name': '용돈', 'color': '#F59E0B', 'icon': 'gift'},
        {'name': '부업', 'color': '#8B5CF6', 'icon': 'briefcase'},
        {'name': '기타수입', 'color': '#06B6D4', 'icon': 'plus-circle'},
    ]
    
    # 기본 지출 카테고리들
    expense_categories = [
        {'name': '식비', 'color': '#EF4444', 'icon': 'utensils'},
        {'name': '교통비', 'color': '#3B82F6', 'icon': 'car'},
        {'name': '쇼핑', 'color': '#EC4899', 'icon': 'shopping-bag'},
        {'name': '문화생활', 'color': '#F97316', 'icon': 'film'},
        {'name': '의료비', 'color': '#84CC16', 'icon': 'heart'},
        {'name': '교육', 'color': '#6366F1', 'icon': 'book'},
        {'name': '기타지출', 'color': '#6B7280', 'icon': 'minus-circle'},
    ]
    
    created_categories = []
    
    # 수입 카테고리 생성
    for cat_data in income_categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            type='income',
            user=user,
            defaults={
                'color': cat_data['color'],
                'icon': cat_data['icon']
            }
        )
        if created:
            created_categories.append(category)
    
    # 지출 카테고리 생성
    for cat_data in expense_categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            type='expense',
            user=user,
            defaults={
                'color': cat_data['color'],
                'icon': cat_data['icon']
            }
        )
        if created:
            created_categories.append(category)
    
    serializer = CategorySerializer(created_categories, many=True)
    return Response({
        'message': f'{len(created_categories)}개의 기본 카테고리가 생성되었습니다.',
        'categories': serializer.data
    }, status=status.HTTP_201_CREATED) 