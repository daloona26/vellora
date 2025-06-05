from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken 

from .serializers import RegisterSerializer, UserSerializer, UserLoginSerializer 
from django.contrib.auth import get_user_model 

User = get_user_model() 

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,) 

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True): 
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,) 

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True): 
            user = serializer.validated_data['user'] 

            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_200_OK)


class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all() 
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
