from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Category, Transaction, Budget, TotalBudget, UserSettings
from decimal import Decimal
import json
from django.utils import timezone

class ModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.category = Category.objects.create(name='Test Category', type='expense', user=self.user)
        self.transaction = Transaction.objects.create(
            amount=-100,
            date=timezone.now().date(),
            description='Test Transaction',
            category=self.category,
            user=self.user
        )
        self.budget = Budget.objects.create(
            amount=1000,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=30),
            category=self.category,
            user=self.user
        )
        self.total_budget = TotalBudget.objects.create(
            amount=5000,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=30),
            user=self.user
        )
        self.user_settings = UserSettings.objects.create(
            user=self.user,
            notifications_enabled=True,
            dark_mode=False,
            language='en'
        )

    def test_category_str(self):
        self.assertEqual(str(self.category), "Test Category (Expense)")

    def test_transaction_str(self):
        expected = f"-100.00 - {self.category} - {self.transaction.date}"
        self.assertEqual(str(self.transaction), expected)

    def test_budget_str(self):
        expected = f"{self.category} - 1000.00"
        self.assertEqual(str(self.budget), expected)

    def test_total_budget_str(self):
        self.assertEqual(str(self.total_budget), "Total Budget: 5000.00")

    def test_user_settings_str(self):
        self.assertEqual(str(self.user_settings), "testuser's settings")

    def test_transaction_save(self):
        income_category = Category.objects.create(name='Income', type='income', user=self.user)
        income_transaction = Transaction.objects.create(
            amount=200,
            date=timezone.now().date(),
            description='Income Transaction',
            category=income_category,
            user=self.user
        )
        self.assertEqual(income_transaction.amount, Decimal('200.00'))
        
        expense_transaction = Transaction.objects.create(
            amount=300,
            date=timezone.now().date(),
            description='Expense Transaction',
            category=self.category,
            user=self.user
        )
        self.assertEqual(expense_transaction.amount, Decimal('-300.00'))

    def test_budget_remaining(self):
        Transaction.objects.create(
        amount=-50,
        date=timezone.now().date(),
        description='Test Expense',
        category=self.category,
        user=self.user
    )
        remaining = self.budget.remaining_budget()
        self.assertAlmostEqual(remaining, Decimal('850.00'), places=2)

    def test_total_budget_remaining(self):
        Transaction.objects.create(
        amount=-200,
        date=timezone.now().date(),
        description='Test Expense',
        category=self.category,
        user=self.user
    )
        remaining = self.total_budget.total_remaining_budget()
        self.assertAlmostEqual(remaining, Decimal('4700.00'), places=2)

class ViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.client.login(username='testuser', password='12345')
        self.category = Category.objects.create(name='Test Category', type='expense', user=self.user)

    def test_dashboard_view(self):
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'budget/dashboard.html')

    def test_transaction_list_view(self):
        response = self.client.get(reverse('transaction_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'budget/transaction_list.html')

    def test_add_transaction_view(self):
        response = self.client.get(reverse('add_transaction'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'budget/add_transaction.html')

        post_data = {
            'amount': 100,
            'date': timezone.now().date(),
            'description': 'Test Transaction',
            'category': self.category.id
        }
        response = self.client.post(reverse('add_transaction'), data=post_data)
        self.assertRedirects(response, reverse('dashboard'))

class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name='Test Category', type='expense', user=self.user)

    def test_dashboard_api(self):
        response = self.client.get(reverse('api_dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('income', response.data)
        self.assertIn('expenses', response.data)
        self.assertIn('balance', response.data)

    def test_transaction_list_create_api(self):
        response = self.client.get(reverse('api_transactions'))
        self.assertEqual(response.status_code, 200)

        post_data = {
            'amount': '-100.00',
            'date': str(timezone.now().date()),
            'description': 'API Test Transaction',
            'category_id': self.category.id
        }
        response = self.client.post(reverse('api_transactions'), data=json.dumps(post_data), content_type='application/json')
        if response.status_code != 201:
            print(f"Error response: {response.content}")
        self.assertEqual(response.status_code, 201)

    def test_category_list_create_api(self):
        response = self.client.get(reverse('api_categories'))
        self.assertEqual(response.status_code, 200)

        post_data = {
            'name': 'New Category',
            'type': 'income'
        }
        response = self.client.post(reverse('api_categories'), data=json.dumps(post_data), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_budget_list_create_api(self):
        response = self.client.get(reverse('api_budgets'))
        self.assertEqual(response.status_code, 200)

        post_data = {
            'amount': '1000.00',
            'start_date': str(timezone.now().date()),
            'end_date': str(timezone.now().date() + timezone.timedelta(days=30)),
            'category': self.category.id
        }
        response = self.client.post(reverse('api_budgets'), data=json.dumps(post_data), content_type='application/json')
        if response.status_code != 201:
            print(f"Error response: {response.content}")
        self.assertEqual(response.status_code, 201)

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='12345')

    def test_login(self):
        response = self.client.post(reverse('login_view'), data=json.dumps({'username': 'testuser', 'password': '12345'}), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_invalid_login(self):
        response = self.client.post(reverse('login_view'), data=json.dumps({'username': 'testuser', 'password': 'wrongpassword'}), content_type='application/json')
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    import unittest
    unittest.main()