from django.contrib import admin
from .models import Category, Transaction, Budget, TotalBudget

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'user')
    list_filter = ('type', 'user')
    search_fields = ('name', 'user__username')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('date', 'amount', 'category', 'description', 'user', 'transaction_type')
    list_filter = ('date', 'category', 'user')
    search_fields = ('description', 'category__name', 'user__username')
    date_hierarchy = 'date'

    def transaction_type(self, obj):
        return 'Income' if obj.amount >= 0 else 'Expense'
    transaction_type.short_description = 'Type'

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'start_date', 'end_date', 'user', 'remaining_budget')
    list_filter = ('category', 'user', 'start_date', 'end_date')
    search_fields = ('category__name', 'user__username')
    date_hierarchy = 'start_date'

    def remaining_budget(self, obj):
        return obj.remaining_budget()
    remaining_budget.short_description = 'Remaining'

@admin.register(TotalBudget)
class TotalBudgetAdmin(admin.ModelAdmin):
    list_display = ('amount', 'start_date', 'end_date', 'user', 'total_remaining_budget')
    list_filter = ('user', 'start_date', 'end_date')
    search_fields = ('user__username',)
    date_hierarchy = 'start_date'

    def total_remaining_budget(self, obj):
        return obj.total_remaining_budget()
    total_remaining_budget.short_description = 'Total Remaining'