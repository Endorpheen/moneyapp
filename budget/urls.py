from django.urls import path
from . import views
from . import api
from rest_framework.authtoken.views import obtain_auth_token
from .views import dashboard, transaction_list, add_transaction, budget_list, add_budget, dashboard_view, login_view

urlpatterns = [
    # Существующие URL-паттерны для веб-интерфейса
    path('', views.dashboard, name='dashboard'),
    path('transactions/', views.transaction_list, name='transaction_list'),
    path('add/', views.add_transaction, name='add_transaction'),
    path('budgets/', views.budget_list, name='budget_list'),
    path('budgets/add/', views.add_budget, name='add_budget'),
    
    # API endpoints
    path('api/login/', login_view, name='login_view'),
    path('api/dashboard/', api.DashboardView.as_view(), name='api_dashboard'),
    path('api/transactions/', api.TransactionListCreateView.as_view(), name='api_transactions'),
    path('api/transactions/<int:pk>/', api.TransactionDetailView.as_view(), name='api_transaction_detail'),
    path('api/categories/', api.CategoryListCreateView.as_view(), name='api_categories'),
    path('api/categories/<int:pk>/', api.CategoryDetailView.as_view(), name='api_category_detail'),
    path('api/budgets/', api.BudgetListCreateView.as_view(), name='api_budgets'),
    path('api/budgets/<int:pk>/', api.BudgetDetailView.as_view(), name='api_budget_detail'),
    
    # Новые API endpoints
    path('api/user-profile/', api.UserProfileView.as_view(), name='api_user_profile'),
    path('api/statistics/', api.StatisticsView.as_view(), name='api_statistics'),
    path('api/export-data/', api.ExportDataView.as_view(), name='api_export_data'),
    path('api/import-data/', api.ImportDataView.as_view(), name='api_import_data'),
    ]
