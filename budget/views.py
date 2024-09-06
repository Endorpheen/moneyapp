from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Q
from .models import Transaction, Category, Budget
from .forms import TransactionForm, BudgetForm

@login_required
def dashboard(request):
    income = Transaction.objects.filter(user=request.user, category__type='income').aggregate(Sum('amount'))['amount__sum'] or 0
    expenses = Transaction.objects.filter(user=request.user, category__type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
    
    # Убедимся, что расходы всегда положительное число
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
    
    # Фильтрация
    category = request.GET.get('category')
    if category:
        transactions = transactions.filter(category__name=category)
    
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    if date_from and date_to:
        transactions = transactions.filter(date__range=[date_from, date_to])
    
    # Поиск
    query = request.GET.get('q')
    if query:
        transactions = transactions.filter(
            Q(description__icontains=query) | Q(category__name__icontains=query)
        )
    
    # Сортировка
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