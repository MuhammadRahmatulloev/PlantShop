from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, UserProfileView, CategoryViewSet, PlantViewSet, CartViewSet, OrderViewSet, ReviewViewSet, VerifyEmailView
from .views import ForgotPasswordView, ResetPasswordView
from .views import ChangePasswordView


router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('plants', PlantViewSet, basename='plant')
router.register('cart', CartViewSet, basename='cart')
router.register('orders', OrderViewSet, basename='order')
router.register('reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('verify/', VerifyEmailView.as_view(), name='verify-email'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]