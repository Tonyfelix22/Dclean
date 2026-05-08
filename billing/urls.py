from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("plans", views.PlanViewSet, basename="plan")
router.register("subscriptions", views.SubscriptionViewSet, basename="subscription")
router.register("invoices", views.InvoiceViewSet, basename="invoice")

urlpatterns = [path("", include(router.urls))]
