from django.urls import path
from expensetrackerapp import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns =[
    path('register/',views.RegisterView.as_view()),
    path('login/',views.LoginView.as_view()),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh' ),

    path('categories/',views.CategoryView.as_view()),
    path('categories/<int:id>/',views.CategoryUpdate.as_view()),

    path('transactions/',views.TransactionView.as_view()),
    path('transactions/<int:id>/',views.TransactionUpdate.as_view()),

    
    path('recenttransactions/',views.RecentTransactions.as_view()),

    path('dailybudget/',views.DailyBudget.as_view()),
    path('monthlybudget/',views.MonthlyBudget.as_view()),

    path('monthly-category-expense/',views.MonthlyCategoryExpense.as_view()),


]

