from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer 

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'full_name', 'address', 'phone_number', 'email', 'payment_method', 'created_at', 'items']
        read_only_fields = ['user', 'total_price', 'status', 'created_at', 'items']