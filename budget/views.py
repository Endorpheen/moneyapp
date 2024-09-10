from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Q
from .models import Transaction, Category, Budget, TotalBudget
from .forms import TransactionForm, BudgetForm
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import logging
from .serializers import TransactionSerializer, CategorySerializer, BudgetSerializer, UserProfileSerializer, TotalBudgetSerializer

logger = logging.getLogger(__name__)

@login_required
def dashboard(request):
    income = Transaction.objects.filter(user=request.user, amount__gt=0).aggregate(Sum('amount'))['amount__sum'] or 0
    expenses = abs(Transaction.objects.filter(user=request.user, amount__lt=0).aggregate(Sum('amount'))['amount__sum'] or 0)
    balance = income - expenses
    
    recent_transactions = Transaction.objects.filter(user=request.user).order_by('-date', '-id')[:10]
    budgets = Budget.objects.filter(user=request.user)
    total_budget = TotalBudget.objects.filter(user=request.user).first()
    
    context = {
        'income': income,
        'expenses': expenses,
        'balance': balance,
        'recent_transactions': recent_transactions,
        'budgets': budgets,
        'total_budget': total_budget,
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
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    logger.debug("Received request: %s %s", request.method, request.path)
    logger.debug("User: %s", request.user)
    logger.debug("Auth: %s", request.auth)
    
    income = Transaction.objects.filter(user=request.user, amount__gt=0).aggregate(Sum('amount'))['amount__sum'] or 0
    expenses = abs(Transaction.objects.filter(user=request.user, amount__lt=0).aggregate(Sum('amount'))['amount__sum'] or 0)
    balance = income - expenses
    
    recent_transactions = Transaction.objects.filter(user=request.user).order_by('-date', '-id')[:10]
    budgets = Budget.objects.filter(user=request.user)
    total_budget = TotalBudget.objects.filter(user=request.user).first()
    
    data = {
        'income': income,
        'expenses': expenses,
        'balance': balance,
        'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
        'budgets': BudgetSerializer(budgets, many=True).data,
        'total_budget': TotalBudgetSerializer(total_budget).data if total_budget else None,
    }
    return Response(data)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    logger.debug("Login view called")
    logger.debug("Request data: %s", request.data)
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
    
### Новые функции для удаления всех транзакций и всех бюджетов ###
@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_all_transactions(request):
    user = request.user
    Transaction.objects.filter(user=user).delete()
    return Response({"message": "Все транзакции удалены"}, status=204)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_all_budgets(request):
    user = request.user
    Budget.objects.filter(user=user).delete()
    return Response({"message": "Все бюджеты удалены"}, status=204)
###    

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class StatisticsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        total_income = Transaction.objects.filter(user=user, amount__gt=0).aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = abs(Transaction.objects.filter(user=user, amount__lt=0).aggregate(Sum('amount'))['amount__sum'] or 0)
        savings_rate = (total_income - total_expenses) / total_income * 100 if total_income > 0 else 0
        
        return Response({
            'total_income': total_income,
            'total_expenses': total_expenses,
            'savings_rate': round(savings_rate, 2),
        })

class ExportDataView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        transactions = TransactionSerializer(Transaction.objects.filter(user=user), many=True).data
        categories = CategorySerializer(Category.objects.filter(user=user), many=True).data
        budgets = BudgetSerializer(Budget.objects.filter(user=user), many=True).data
        total_budget = TotalBudgetSerializer(TotalBudget.objects.filter(user=user).first()).data
        
        export_data = {
            'transactions': transactions,
            'categories': categories,
            'budgets': budgets,
            'total_budget': total_budget,
        }
        return Response(export_data)

class ImportDataView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Здесь добавьте логику для импорта данных пользователя
        return Response({'message': 'Data import functionality not implemented yet'})