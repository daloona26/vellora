from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction 
from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer, CartItemSerializer

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensure users can only see/manage their own cart
        return self.queryset.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        # For a single user's cart, retrieve acts like get_object
        # We ensure a cart exists for the user when they try to retrieve it
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # This method is for creating a new Cart object, usually not directly used
        # when a user automatically gets a cart or it's created via add_item.
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
        product_id = request.data.get('product_id')
        quantity_to_add = int(request.data.get('quantity', 1))

        if not product_id or quantity_to_add <= 0:
            return Response({"detail": "product_id and a positive quantity are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        cart, created = Cart.objects.get_or_create(user=request.user)

        with transaction.atomic(): # Ensure atomicity for stock and cart item updates
            cart_item, item_created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': 0} # Start at 0 to add quantity_to_add
            )

            # Calculate new total quantity for the item in cart
            new_total_quantity_in_cart = cart_item.quantity + quantity_to_add

            # Check stock before proceeding
            if product.stock < quantity_to_add: # Check if current addition exceeds stock
                return Response({"detail": f"Not enough stock for {product.name}. Only {product.stock} available."}, status=status.HTTP_400_BAD_REQUEST)
            
            if product.stock < new_total_quantity_in_cart - cart_item.quantity: # Check if total quantity in cart + new addition exceeds stock
                return Response({"detail": f"Adding {quantity_to_add} of {product.name} would exceed available stock. Only {product.stock} left."}, status=status.HTTP_400_BAD_REQUEST)


            # Update cart item quantity
            cart_item.quantity = new_total_quantity_in_cart
            cart_item.save()

            # Reduce product stock
            product.stock -= quantity_to_add
            product.save()

        serializer = CartSerializer(cart) # Serialize the entire cart for response
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='remove-item')
    def remove_item(self, request):
        product_id = request.data.get('product_id')

        if not product_id:
            return Response({"detail": "product_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, cart=cart, product__id=product_id)

        with transaction.atomic(): # Ensure atomicity
            # Return stock to the product
            product = cart_item.product
            product.stock += cart_item.quantity
            product.save()

            cart_item.delete()

        serializer = CartSerializer(cart) # Serialize the entire cart for response
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='update-item-quantity')
    def update_item_quantity(self, request):
        product_id = request.data.get('product_id')
        new_quantity = int(request.data.get('quantity'))

        if product_id is None or new_quantity is None or new_quantity < 0:
            return Response({"detail": "product_id and a non-negative quantity are required."}, status=status.HTTP_400_BAD_REQUEST)

        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, cart=cart, product__id=product_id)
        product = cart_item.product
        old_quantity = cart_item.quantity

        with transaction.atomic(): # Ensure atomicity
            if new_quantity == 0:
                # If new quantity is 0, remove the item
                product.stock += old_quantity # Return all stock
                product.save()
                cart_item.delete()
            else:
                quantity_difference = new_quantity - old_quantity

                if quantity_difference > 0: # Increasing quantity
                    if product.stock < quantity_difference:
                        return Response({"detail": f"Not enough stock to increase quantity. Only {product.stock} available."}, status=status.HTTP_400_BAD_REQUEST)
                    product.stock -= quantity_difference
                elif quantity_difference < 0: # Decreasing quantity
                    product.stock += abs(quantity_difference)
                
                cart_item.quantity = new_quantity
                cart_item.save()
                product.save()

        serializer = CartSerializer(cart) 
        return Response(serializer.data, status=status.HTTP_200_OK)

