from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from .models import User, Profile
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, ProfileSerializer


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """사용자 회원가입"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': '회원가입이 완료되었습니다.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """사용자 로그인"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': '로그인되었습니다.'
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout(request):
    """사용자 로그아웃"""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': '로그아웃되었습니다.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': '로그아웃 중 오류가 발생했습니다.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """사용자 프로필 조회/수정"""
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile


class UserProfileView(generics.RetrieveUpdateAPIView):
    """사용자 정보 조회/수정"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['POST'])
def change_password(request):
    """비밀번호 변경"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({
            'error': '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 현재 비밀번호 확인
    if not check_password(current_password, user.password):
        return Response({
            'current_password': '현재 비밀번호가 올바르지 않습니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 새 비밀번호 검증
    if len(new_password) < 8:
        return Response({
            'new_password': '새 비밀번호는 최소 8자 이상이어야 합니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 현재 비밀번호와 새 비밀번호가 같은지 확인
    if check_password(new_password, user.password):
        return Response({
            'new_password': '새 비밀번호는 현재 비밀번호와 달라야 합니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 비밀번호 변경
    user.set_password(new_password)
    user.save()
    
    return Response({
        'message': '비밀번호가 성공적으로 변경되었습니다.'
    }, status=status.HTTP_200_OK) 