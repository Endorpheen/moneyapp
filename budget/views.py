from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Q
from .models import Transaction, Category, Budget
from .forms import TransactionForm, BudgetForm
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import logging

logger = logging.getLogger(__name__)

@login_required
def dashboard(request):
    income = Transaction.objects.filter(user=request.user, category__type='income').aggregate(Sum('amount'))['amount__sum'] or 0
    expenses = Transaction.objects.filter(user=request.user, category__type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
    
    expenses = abs(expenses)
    balance = income - expenses
    
    recent_transactions = Transaction.objects.filter(user=request.user).order_by('-date')[:5]
    budgets = Budget.objects.filter(user=request.user)
    
    context = {
        'income': income,
        'expenses': expenses,
        'balance': balance,
        'recent_transactions': recent_transactions,
        'budgets': budgets,
    }
    return render(request, 'budget/dashboard.html', context)

@login_required
def transaction_list(request):
    transactions = Transaction.objects.filter(user=request.user)
    
    category = request.GET.get('category')
    if category:
        transactions = transactions.filter(category__name=category)
    
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    if date_from and date_to:
        transactions = transactions.filter(date__range=[date_from, date_to])
    
    query = request.GET.get('q')
    if query:
        transactions = transactions.filter(
            Q(description__icontains=query) | Q(category__name__icontains=query)
        )
    
    sort = request.GET.get('sort', '-date')
    transactions = transactions.order_by(sort)
    
    categories = Category.objects.filter(user=request.user)
    
    context = {
        'transactions': transactions,
        'categories': categories,
    }
    return render(request, 'budget/transaction_list.html', context)

@login_required
def add_transaction(request):
    if request.method == 'POST':
        form = TransactionForm(request.POST, user=request.user)
        if form.is_valid():
            transaction = form.save(commit=False)
            transaction.user = request.user
            transaction.save()
            return redirect('dashboard')
    else:
        form = TransactionForm(user=request.user)
    return render(request, 'budget/add_transaction.html', {'form': form})

@login_required
def budget_list(request):
    budgets = Budget.objects.filter(user=request.user)
    return render(request, 'budget/budget_list.html', {'budgets': budgets})

@login_required
def add_budget(request):
    if request.method == 'POST':
        form = BudgetForm(request.POST)
        if form.is_valid():
            budget = form.save(commit=False)
            budget.user = request.user
            budget.save()
            return redirect('budget_list')
    else:
        form = BudgetForm()
    return render(request, 'budget/add_budget.html', {'form': form})

@csrf_exempt
@api_view(['GET'])
def dashboard_view(request):
    print("Received request:", request.method, request.path)
    print("User:", request.user)
    print("Auth:", request.auth)
    
    income = Transaction.objects.filter(user=request.user, category__type='income').aggregate(Sum('amount'))['amount__sum'] or 0
    expenses = Transaction.objects.filter(user=request.user, category__type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
    
    expenses = abs(expenses)
    balance = income - expenses
    
    recent_transactions = Transaction.objects.filter(user=request.user).order_by('-date')[:5].values()
    budgets = Budget.objects.filter(user=request.user).values()
    
    data = {
        'income': income,
        'expenses': expenses,
        'balance': balance,
        'recent_transactions': list(recent_transactions),
        'budgets': list(budgets),
    }
    return Response(data)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    print("Login view called")
    print("Request data:", request.data)
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)