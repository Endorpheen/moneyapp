from rest_framework import serializers
from .models import Transaction, Category, Budget, TotalBudget
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserSettings

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

    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id:
            instance.category = category_id
        return super().update(instance, validated_data)

class BudgetSerializer(serializers.ModelSerializer):
    remaining_budget = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = ['id', 'category', 'amount', 'start_date', 'end_date', 'remaining_budget']

class TotalBudgetSerializer(serializers.ModelSerializer):
    total_remaining_budget = serializers.ReadOnlyField()

    class Meta:
        model = TotalBudget
        fields = ['id', 'amount', 'start_date', 'end_date', 'total_remaining_budget']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']
        read_only_fields = ['username']
        extra_kwargs = {'password': {'write_only': True}}

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        return instance


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['notifications_enabled', 'dark_mode', 'language']        