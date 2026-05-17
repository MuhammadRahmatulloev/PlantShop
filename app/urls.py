from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, UserProfileView, CategoryViewSet, PlantViewSet, CartViewSet, OrderViewSet, ReviewViewSet, VerifyEmailView


router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('plants', PlantViewSet, basename='plant')
router.register('cart', CartViewSet, basename='cart')
router.register('orders', OrderViewSet, basename='order')
router.register('reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/', VerifyEmailView.as_view(), name='verify-email'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]