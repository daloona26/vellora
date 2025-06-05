from django.contrib import admin
from .models import Cart, CartItem

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    search_fields = ('user__username',) 

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'get_username') 
    list_filter = ('cart__user__username', 'product__category') 
    search_fields = ('product__name', 'cart__user__username') 

    def get_username(self, obj):
        """
        Returns the username of the user who owns the cart for this item.
        """
        return obj.cart.user.username
    get_username.short_description = 'User' 