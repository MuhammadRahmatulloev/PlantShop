from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.mixins import DestroyModelMixin
from rest_framework.viewsets import GenericViewSet
from django.core.cache import cache
from django.conf import settings
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from drf_spectacular.utils import extend_schema

from .models import User, Category, Plant, Cart, CartItem, Order, Review
from .serializers import (
    UserRegisterSerializer, UserSerializer,
    CategorySerializer,
    PlantSerializer, PlantDetailSerializer,
    CartSerializer, CartItemSerializer,
    OrderSerializer,
    ReviewSerializer,
)
from .permissions import IsSellerOrAdmin, IsOwnerOrAdmin, ReadOnlyOrSeller
from .filters import PlantFilter
from .tasks import send_order_confirmation_email
from .serializers import VerifyEmailSerializer


@extend_schema(tags=['Auth'])
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


@extend_schema(tags=['Auth'])
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    

@extend_schema(tags=['Auth'])
class VerifyEmailView(generics.GenericAPIView):
    serializer_class = VerifyEmailSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Email verified successfully.'}, status=status.HTTP_200_OK)


@extend_schema(tags=['Categories'])
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cached = cache.get('categories')
        if cached is not None:
            return cached
        queryset = Category.objects.all()
        cache.set('categories', queryset, settings.CACHE_TTL)
        return queryset


@extend_schema(tags=['Plants'])
class PlantViewSet(viewsets.ModelViewSet):
    permission_classes = [ReadOnlyOrSeller]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = PlantFilter
    search_fields = ['name', 'description']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PlantDetailSerializer
        return PlantSerializer

    def get_queryset(self):
        if self.action == 'list' and not self.request.query_params:
            cached = cache.get('plants_list')
            if cached is not None:
                return cached
            queryset = Plant.objects.select_related('category').filter(is_available=True)
            cache.set('plants_list', queryset, settings.CACHE_TTL)
            return queryset
        return Plant.objects.select_related('category').prefetch_related('reviews__user')

    def perform_create(self, serializer):
        cache.delete('plants_list')
        serializer.save()

    def perform_update(self, serializer):
        cache.delete(f'plant_{self.kwargs["slug"]}')
        cache.delete('plants_list')
        serializer.save()

    def perform_destroy(self, instance):
        cache.delete(f'plant_{instance.slug}')
        cache.delete('plants_list')
        instance.delete()

    @extend_schema(tags=['Reviews'])
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reviews(self, request, slug=None):
        plant = self.get_object()
        serializer = ReviewSerializer(
            data=request.data,
            context={'request': request, 'plant': plant}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(tags=['Cart'])
class CartViewSet(GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart=self.request.user.cart)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = CartSerializer(request.user.cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        cart = request.user.cart
        plant_id = request.data.get('plant_id')
        quantity = int(request.data.get('quantity', 1))
        plant = get_object_or_404(Plant, id=plant_id, is_available=True)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, plant=plant)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()
        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def update_item(self, request, pk=None):
        cart_item = get_object_or_404(CartItem, pk=pk, cart=request.user.cart)
        quantity = request.data.get('quantity')
        if quantity:
            cart_item.quantity = int(quantity)
            cart_item.save()
        return Response(CartItemSerializer(cart_item).data)

    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        cart_item = get_object_or_404(CartItem, pk=pk, cart=request.user.cart)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        request.user.cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=['Orders'])
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'seller']:
            return Order.objects.all().prefetch_related('items__plant')
        return Order.objects.filter(user=user).prefetch_related('items__plant')

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsSellerOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        order = serializer.save()
        send_order_confirmation_email.delay(
            self.request.user.email,
            order.id,
            str(order.total_price)
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsSellerOrAdmin])
    def set_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)


@extend_schema(tags=['Reviews'])
class ReviewViewSet(DestroyModelMixin, GenericViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)