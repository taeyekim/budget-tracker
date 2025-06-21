from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Profile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """사용자 회원가입 시리얼라이저"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user


class UserLoginSerializer(serializers.Serializer):
    """사용자 로그인 시리얼라이저"""
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("이메일 또는 비밀번호가 올바르지 않습니다.")
            if not user.is_active:
                raise serializers.ValidationError("계정이 비활성화되었습니다.")
            attrs['user'] = user
        else:
            raise serializers.ValidationError("이메일과 비밀번호를 모두 입력해주세요.")
        
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    """프로필 시리얼라이저"""
    class Meta:
        model = Profile
        fields = ('monthly_budget', 'currency')


class UserSerializer(serializers.ModelSerializer):
    """사용자 정보 시리얼라이저"""
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'profile_image', 'profile', 'created_at')
        read_only_fields = ('id', 'created_at') 