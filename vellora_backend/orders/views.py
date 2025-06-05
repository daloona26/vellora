from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from users.models import User
from .models import Order, OrderItem
from cart.models import Cart
from products.models import Product

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    user = request.user
    cart_id = request.data.get('cart_id')
    delivery_info = request.data.get('delivery_info', {})
    payment_method = request.data.get('payment_method', 'Cash on Delivery')

    if not cart_id:
        return Response({'detail': 'Cart ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        cart = Cart.objects.get(id=cart_id, user=user)
    except Cart.DoesNotExist:
        return Response({'detail': 'Cart not found or does not belong to user.'}, status=status.HTTP_404_NOT_FOUND)

    if not cart.items.exists():
        return Response({'detail': 'Cannot place order with an empty cart.'}, status=status.HTTP_400_BAD_REQUEST)

    required_delivery_fields = ['full_name', 'address', 'phone_number', 'email']
    if not all(delivery_info.get(field) for field in required_delivery_fields):
        return Response({'detail': 'All delivery information fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            calculated_total_price = sum(item.quantity * item.product.price for item in cart.items.all())

            order = Order.objects.create(
                user=user,
                total_price=calculated_total_price,
                status='Pending',
                full_name=delivery_info['full_name'],
                address=delivery_info['address'],
                phone_number=delivery_info['phone_number'],
                email=delivery_info['email'],
                payment_method=payment_method
            )

            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price
                )

            cart.items.all().delete()

            subject = 'Your Order Confirmation from Your Store'
            message = f"""
Dear {order.full_name},

Thank you for your order! Your order #{order.id} has been placed successfully.

Order Details:
--------------------------------"""
            for item in order.items.all():
                message += f"\n- {item.product.name} (x{item.quantity}) @ ${item.price:.2f}"
            message += f"\n--------------------------------"
            message += f"\nTotal: ${order.total_price:.2f}"
            message += f"\nPayment Method: {order.payment_method}"
            message += f"\nDelivery Address: {order.address}, Phone: {order.phone_number}"
            message += f"\n\nWe will notify you once your order is shipped."
            message += f"\n\nThanks,\nYour Store Team"

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [order.email],
                fail_silently=False,
            )

            return Response({'detail': 'Order placed successfully and confirmation email sent.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'detail': f'Error processing order: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
