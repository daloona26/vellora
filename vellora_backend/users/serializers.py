from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError # Alias to avoid clash
from django.contrib.auth import authenticate # Import authenticate

User = get_user_model() 

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'address', 'phone_number'] # Ensure all fields are here


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2') 
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    # This field will accept either username or email
    username_or_email = serializers.CharField(required=True) 
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')

        if not username_or_email or not password:
            raise serializers.ValidationError("Must include 'username or email' and 'password'.")

        user = None
        # Try to validate as email first
        try:
            validate_email(username_or_email)
            # If it's a valid email format, try to get the user by email
            user = User.objects.filter(email=username_or_email).first()
        except DjangoValidationError:
            # If it's not a valid email format, assume it's a username
            user = User.objects.filter(username=username_or_email).first()

        # If a user is found by either username or email, then authenticate
        if user:
            # Use Django's authenticate function to verify password
            authenticated_user = authenticate(username=user.username, password=password)
            if authenticated_user:
                attrs['user'] = authenticated_user # Store the authenticated user object
                return attrs
            else:
                raise serializers.ValidationError("Invalid credentials.")
        else:
            raise serializers.ValidationError("Invalid credentials.")
