from rest_framework import serializers
from .models import Budget
from transactions.serializers import CategorySerializer


class BudgetSerializer(serializers.ModelSerializer):
    """예산 시리얼라이저"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    spent_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    usage_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Budget
        fields = (
            'id', 'name', 'amount', 'period', 'category', 'category_name', 
            'category_color', 'start_date', 'end_date', 'is_active',
            'spent_amount', 'remaining_amount', 'usage_percentage',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_category(self, value):
        """카테고리가 현재 사용자의 것인지 확인"""
        if value:
            user = self.context['request'].user
            if value.user != user:
                raise serializers.ValidationError("본인의 카테고리만 사용할 수 있습니다.")
            if value.type != 'expense':
                raise serializers.ValidationError("지출 카테고리만 예산으로 설정할 수 있습니다.")
        return value

    def validate(self, attrs):
        """시작일과 종료일 유효성 검증"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError({
                    'end_date': '종료일은 시작일보다 늦어야 합니다.'
                })
        
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 