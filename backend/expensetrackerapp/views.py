
from django.shortcuts import render
from django.utils import timezone
from rest_framework import generics,status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework.response import Response
from django.http import Http404
from django.db.models import Sum, Q
from django.db.models.functions import TruncMonth

from expensetrackerapp.models import Category, Transaction
from expensetrackerapp.serializers import CategorySerializer, LoginSerializer, RegisterSerializer, TransactionSerializer



class RegisterView(generics.ListCreateAPIView):
    queryset=User.objects.all()
    serializer_class=RegisterSerializer
    permission_classes=[AllowAny]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Registration successful!",
            "username": user.username,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self,request):
        serializer_class=LoginSerializer(data=request.data)
        if serializer_class.is_valid():
            user=serializer_class.validated_data['user']
            refresh=RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username
            })
        return Response(
            serializer_class.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

#category   
class CategoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        category = Category.objects.filter(user=self.request.user)
        serializer = CategorySerializer(category, many=True,context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data,context={'request':request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryUpdate(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self,id,user):
        try:
            return Category.objects.get(id=id,user=user)
        except Category.DoesNotExist:
            raise Http404

    def get(self,request,id,format=None):
        category=self.get_object(id,request.user,context={'request':request})
        serializer=CategorySerializer(category)
        return Response(serializer.data)

    def put(self,request,id,format=None):
        category=self.get_object(id,request.user)
        serializer=CategorySerializer(category,data=request.data,context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    def delete(self,request,id,format=None):
        category=self.get_object(id,request.user)
        category.delete()
        return Response(
        {"message": "Category deleted successfully!"},
        status=status.HTTP_200_OK
    )



# Transcations
class TransactionView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        transactions=Transaction.objects.filter(user=self.request.user).order_by('-date')
        serializer=TransactionSerializer(transactions,many=True,context={'request':request})
        return Response(serializer.data)

    def post(self,request):
        serializer=TransactionSerializer(data=request.data,context={'request':request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class TransactionUpdate(APIView):
    permission_classes=[IsAuthenticated]
    def get_object(self,id,user):
        try:
            return Transaction.objects.get(id=id,user=user)
        except Transaction.DoesNotExist:
            raise Http404
    def get(self,request,id,format=None):
            transactions=self.get_object(id,request.user)
            serializer=TransactionSerializer(transactions,context={'request':request})
            return Response(serializer.data)
    
    def put(self,request,id,format=None):
        transactions=self.get_object(id,request.user)
        serializer=TransactionSerializer(transactions,data=request.data,context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,id,format=None):
        transactions=self.get_object(id,request.user)
        transactions.delete()
        return Response(
        {"message": "Transaction deleted successfully!"},
        status=status.HTTP_200_OK
      )
  

class RecentTransactions(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        transactions=Transaction.objects.filter(user=request.user).order_by('-date')[:3]
        serializer=TransactionSerializer(transactions,many=True)
        return Response(serializer.data)


#summary cards
class DailyBudget(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        budget=Transaction.objects.filter(user=request.user).values('date').annotate(
            total_income=Sum('amount',filter=Q(transaction_type='income')),
            total_expense=Sum('amount',filter=Q(transaction_type='expense'))
            ).order_by('date')
        result=[
            {
                'date':item['date'],
                'total_income':item['total_income'] or 0,
                'total_expense':item['total_expense'] or 0
            }
            for item in budget
        ]
        return Response(result)
 
class MonthlyBudget(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        budget=Transaction.objects.filter(user=request.user).annotate(month=TruncMonth('date')).values('month').annotate(
            total_income=Sum('amount',filter=Q(transaction_type='income')),
            total_expense=Sum('amount',filter=Q(transaction_type='expense'))
        ).order_by('month')
        result=[
            {
                'date':item['month'].strftime('%Y-%m'),
                'total_income':item['total_income'] or 0,
                'total_expense':item['total_expense'] or 0
    
            }
            for item in budget                 
        ]
        return Response(result)

class MonthlyCategoryExpense(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        today = timezone.localdate()
        try:
            month = int(request.query_params.get("month", today.month))
            year = int(request.query_params.get("year", today.year))
            if month < 1 or month > 12 or year < 1:
                return Response(
                    {"error": "Invalid month or year"},
                    status=400
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "Month and year must be valid numbers"},
                status=400
            )
        expenses = (Transaction.objects.filter(user=request.user,transaction_type="expense",date__year=year,date__month=month)
            .values("category__name").annotate(
                total_expense=Sum("amount")).order_by("-total_expense"))
        
        result =[
            {
                "category": item["category__name"] or "Uncategorized",
                "transaction_type": "expense",
                "total_expense": item["total_expense"] or 0
            }
            for item in expenses
        ]
        return Response(result)