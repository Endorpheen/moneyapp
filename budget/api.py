from rest_framework.views import APIView
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from django.db.models import Sum
from .models import Transaction, Category, Budget, TotalBudget
from .serializers import TransactionSerializer, CategorySerializer, BudgetSerializer, TotalBudgetSerializer, UserProfileSerializer
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from .models import UserSettings
from .serializers import UserSettingsSerializer

@method_decorator(ensure_csrf_cookie, name='dispatch')
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        user = request.user
        income = Transaction.objects.filter(user=user, amount__gt=0).aggregate(Sum('amount'))['amount__sum'] or 0
        expenses = abs(Transaction.objects.filter(user=user, amount__lt=0).aggregate(Sum('amount'))['amount__sum'] or 0)
        balance = income - expenses
        recent_transactions = Transaction.objects.filter(user=user).order_by('-date', '-id')[:10]
        budgets = Budget.objects.filter(user=user)
        total_budget = TotalBudget.objects.filter(user=user).first()

        data = {
            'income': income,
            'expenses': expenses,
            'balance': balance,
            'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
            'budgets': BudgetSerializer(budgets, many=True).data,
            'total_budget': TotalBudgetSerializer(total_budget).data if total_budget else None,
        }
        return Response(data)

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        category = self.request.query_params.get('category', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if category:
            queryset = queryset.filter(category__name=category)
        if date_from and date_to:
            queryset = queryset.filter(date__range=[date_from, date_to])
        
        return queryset.order_by('-date', '-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

class StatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        user = request.user
        total_income = Transaction.objects.filter(user=user, amount__gt=0).aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = abs(Transaction.objects.filter(user=user, amount__lt=0).aggregate(Sum('amount'))['amount__sum'] or 0)
        savings_rate = (total_income - total_expenses) / total_income * 100 if total_income > 0 else 0
        
        return Response({
            'total_income': total_income,
            'total_expenses': total_expenses,
            'savings_rate': round(savings_rate, 2),
        })

class ExportDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
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

class ImportDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def post(self, request):
        # Здесь добавьте логику для импорта данных пользователя
        return Response({'message': 'Data import functionality not implemented yet'})


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]


class UserSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return UserSettings.objects.get_or_create(user=self.request.user)[0]

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)    