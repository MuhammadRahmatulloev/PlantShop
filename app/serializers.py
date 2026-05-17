from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Category, Plant, Cart, CartItem, Order, OrderItem, Review
import random

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'password', 'password_confirm']  

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        from .tasks import send_verification_email
        validated_data.pop('password_confirm')
        code = str(random.randint(100000, 999999))
        role = validated_data.pop('role', 'client')
        user = User.objects.create_user(**validated_data)
        user.role = role
        user.verification_code = code
        user.is_active = False
        user.save()
        Cart.objects.create(user=user)
        send_verification_email.delay(user.email, code)
        return user


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        users = User.objects.filter(email=attrs['email']).order_by('-id')
        if not users.exists():
            raise serializers.ValidationError({'email': 'User not found.'})
        user = users.first()
        if user.verification_code != attrs['code']:
            raise serializers.ValidationError({'code': 'Invalid code.'})
        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        user.is_verified = True
        user.is_active = True
        user.verification_code = ''
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'avatar', 'role']
        read_only_fields = ['role']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image']


class PlantSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )

    class Meta:
        model = Plant
        fields = [
            'id', 'name', 'slug', 'category', 'category_id',
            'price', 'stock', 'care_level', 'image', 'is_available', 'created_at'
        ]


class PlantDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Plant
        fields = [
            'id', 'name', 'slug', 'category', 'description',
            'price', 'stock', 'care_level', 'image', 'is_available',
            'created_at', 'average_rating', 'reviews'
        ]

    def get_reviews(self, obj):
        reviews = obj.reviews.all()
        return ReviewSerializer(reviews, many=True).data

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)


class CartItemSerializer(serializers.ModelSerializer):
    plant = PlantSerializer(read_only=True)
    plant_id = serializers.PrimaryKeyRelatedField(
        queryset=Plant.objects.all(), source='plant', write_only=True
    )
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'plant', 'plant_id', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.get_total_price()


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price']

    def get_total_price(self, obj):
        return obj.get_total_price()


class OrderItemSerializer(serializers.ModelSerializer):
    plant = PlantSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'plant', 'quantity', 'price', 'total_price']

    def get_total_price(self, obj):
        return obj.get_total_price()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'delivery_address', 'total_price', 'created_at', 'items']
        read_only_fields = ['status', 'total_price']

    def create(self, validated_data):
        user = self.context['request'].user
        cart = user.cart
        cart_items = cart.items.select_related('plant').all()

        if not cart_items.exists():
            raise serializers.ValidationError({'cart': 'Cart is empty.'})

        total_price = sum(item.get_total_price() for item in cart_items)
        order = Order.objects.create(
            user=user,
            total_price=total_price,
            **validated_data
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                plant=item.plant,
                quantity=item.quantity,
                price=item.plant.price
            )

        cart_items.delete()
        return order


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'text', 'created_at']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['plant'] = self.context['plant']
        return super().create(validated_data)