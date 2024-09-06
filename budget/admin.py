from django.contrib import admin
from .models import Category, Transaction, Budget, TotalBudget

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'user')
    list_filter = ('type', 'user')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('date', 'amount', 'category', 'description', 'user')
    list_filter = ('date', 'category', 'user')
    search_fields = ('description',)

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'start_date', 'end_date', 'user')
    list_filter = ('category', 'user')

@admin.register(TotalBudget)
class TotalBudgetAdmin(admin.ModelAdmin):
    list_display = ('amount', 'start_date', 'end_date', 'user')
    list_filter = ('user',)