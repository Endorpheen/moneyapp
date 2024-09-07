from rest_framework.views import APIView
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from django.db.models import Sum
from .models import Transaction, Category, Budget
from .serializers import TransactionSerializer, CategorySerializer, BudgetSerializer
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

@method_decorator(ensure_csrf_cookie, name='dispatch')
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        user = request.user
        income = Transaction.objects.filter(user=user, category__type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        expenses = abs(Transaction.objects.filter(user=user, category__type='expense').aggregate(Sum('amount'))['amount__sum'] or 0)
        balance = income - expenses
        recent_transactions = Transaction.objects.filter(user=user).order_by('-date')[:5]
        budgets = Budget.objects.filter(user=user)

        data = {
            'income': income,
            'expenses': expenses,
            'balance': balance,
            'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
            'budgets': BudgetSerializer(budgets, many=True).data,
        }
        return Response(data)

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

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
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        return Response({
            'username': user.username,
            'email': user.email,
            # Добавьте другие поля профиля по необходимости
        })

class StatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        user = request.user
        # Здесь добавьте логику для вычисления статистики
        return Response({
            'total_income': 0,  # Замените на реальные вычисления
            'total_expenses': 0,  # Замените на реальные вычисления
            'savings_rate': 0,  # Замените на реальные вычисления
        })

class ExportDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        # Здесь добавьте логику для экспорта данных пользователя
        return Response({'message': 'Data export functionality not implemented yet'})

class ImportDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    renderer_classes = [JSONRenderer]

    def post(self, request):
        # Здесь добавьте логику для импорта данных пользователя
        return Response({'message': 'Data import functionality not implemented yet'})