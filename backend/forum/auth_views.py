from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .serializers import UserSerializer, UserProfileSerializer
from .models import UserProfile
from gamification.services import GamificationService


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user
    """
    try:
        # Get data from request
        first_name = request.data.get('firstName', '')
        last_name = request.data.get('lastName', '')
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirmPassword')

        # Validation
        if not all([username, email, password, confirm_password]):
            return Response(
                {'error': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Create user profile if it doesn't exist
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Serialize user data
        user_serializer = UserSerializer(user, context={'request': request})
        profile_serializer = UserProfileSerializer(user.profile, context={'request': request})

        return Response({
            'message': 'Registration successful',
            'user': user_serializer.data,
            'profile': profile_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user and return JWT tokens
    """
    try:
        # Get credentials
        email_or_username = request.data.get('email')  # Can be email or username
        password = request.data.get('password')

        if not email_or_username or not password:
            return Response(
                {'error': 'Email/Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to find user by username or email
        user = None
        if '@' in email_or_username:
            # It's an email
            try:
                user = User.objects.get(email=email_or_username)
            except User.DoesNotExist:
                pass
        else:
            # It's a username
            try:
                user = User.objects.get(username=email_or_username)
            except User.DoesNotExist:
                pass

        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Authenticate user
        authenticated_user = authenticate(username=user.username, password=password)

        if not authenticated_user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(authenticated_user)

        # Ensure user has a profile
        if not hasattr(authenticated_user, 'profile'):
            UserProfile.objects.create(user=authenticated_user)

        # Update daily streak and track gamification
        streak_result = GamificationService.update_daily_streak(authenticated_user)

        # Serialize user data
        user_serializer = UserSerializer(authenticated_user, context={'request': request})
        profile_serializer = UserProfileSerializer(authenticated_user.profile, context={'request': request})

        return Response({
            'message': 'Login successful',
            'user': user_serializer.data,
            'profile': profile_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'gamification': streak_result
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """
    Logout user (client-side token removal)
    Note: Since token blacklisting is not configured, 
    the token will remain valid until it expires.
    The frontend should remove the token from storage.
    """
    try:
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
def get_current_user(request):
    """
    Get current authenticated user
    """
    try:
        user_serializer = UserSerializer(request.user, context={'request': request})
        profile_serializer = UserProfileSerializer(request.user.profile, context={'request': request})
        
        return Response({
            'user': user_serializer.data,
            'profile': profile_serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
