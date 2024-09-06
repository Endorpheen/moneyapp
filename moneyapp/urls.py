from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/budget/', permanent=True)),  # Добавьте эту строку
    path('admin/', admin.site.urls),
    path('budget/', include('budget.urls')),
]