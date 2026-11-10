from rest_framework import serializers

from expensetrackerapp.models import Category, Transaction
from django.contrib.auth.models import User

from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True,min_length=8)
    password2 = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('id','username','email','password1','password2')
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError( "This email is already registered.")
        return value

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password
        )
        return user
  
    
class LoginSerializer(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)
    def validate(self, data):
        username=data.get('username')
        password=data.get('password')
        user=authenticate(username=username,password=password)
        if not user:
            raise serializers.ValidationError(
                "Invalid username or password"
            )
        data['user']=user

        return data



class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name')

    def validate_name(self, data):
        user = self.context['request'].user
        category = Category.objects.filter(user=user,name__iexact=data.strip())
        if self.instance:
            category = category.exclude(id=self.instance.id)
        if category.exists():
            raise serializers.ValidationError("This category already exists.")

        return data.strip()


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Transaction
        fields=('id','category','title','amount','date','transaction_type')

    def validate(self,data):
        user=self.context['request'].user
        category=data.get('category',getattr(self.instance,'category',None))
        if category.user_id != user.id:
            raise serializers.ValidationError("Invalid category")
        if data.get('amount',getattr(self.instance,'amount',0))<=0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return data

       


