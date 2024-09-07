from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.authtoken.views import obtain_auth_token
from django.conf import settings
from django.conf.urls.static import static
from budget.views import login_view

urlpatterns = [
path('admin/', admin.site.urls),
path('budget/', include('budget.urls')),
path('', RedirectView.as_view(url='/budget/', permanent=True)),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
