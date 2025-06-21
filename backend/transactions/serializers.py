from rest_framework import serializers
from .models import Category, Transaction


class CategorySerializer(serializers.ModelSerializer):
    """카테고리 시리얼라이저"""
    transaction_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'type', 'color', 'icon', 'transaction_count', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_transaction_count(self, obj):
        """해당 카테고리의 거래 개수 반환"""
        return obj.transactions.count()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    """거래 내역 시리얼라이저"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    
    class Meta:
        model = Transaction
        fields = (
            'id', 'title', 'amount', 'type', 'category', 'category_name', 
            'category_color', 'category_icon', 'description', 'date', 
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_category(self, value):
        """카테고리가 현재 사용자의 것인지 확인"""
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("본인의 카테고리만 사용할 수 있습니다.")
        return value

    def validate(self, attrs):
        """카테고리 타입과 거래 타입이 일치하는지 확인"""
        category = attrs.get('category')
        transaction_type = attrs.get('type')
        
        if category and transaction_type:
            if category.type != transaction_type:
                raise serializers.ValidationError({
                    'category': '카테고리 타입과 거래 타입이 일치하지 않습니다.'
                })
        
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TransactionStatsSerializer(serializers.Serializer):
    """거래 통계 시리얼라이저"""
    total_income = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=10, decimal_places=2)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    transaction_count = serializers.IntegerField()
    
    # 카테고리별 통계
    category_stats = serializers.ListField(child=serializers.DictField())
    
    # 월별 통계
    monthly_stats = serializers.ListField(child=serializers.DictField()) 