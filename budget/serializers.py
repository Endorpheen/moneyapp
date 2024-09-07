from rest_framework import serializers
from .models import Transaction, Category, Budget

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type']

class TransactionSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'date', 'description', 'category', 'category_id']

    def create(self, validated_data):
        category_id = validated_data.pop('category_id')
        validated_data['category'] = category_id
        return super().create(validated_data)

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'category', 'amount', 'period']