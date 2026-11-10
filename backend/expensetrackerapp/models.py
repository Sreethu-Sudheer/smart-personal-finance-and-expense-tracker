from django.db import models

from django.contrib.auth.models import User

class Category(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='category')
    name=models.CharField(max_length=200)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    TRANSACTION_TYPES=[
            ('income','Income'),
            ('expense','Expense')
    
        ]
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='transactions')
    category=models.ForeignKey(Category,on_delete=models.CASCADE,related_name='transactions')
    title=models.CharField(max_length=200)
    amount=models.DecimalField(max_digits=12,decimal_places=2)
    date=models.DateField()
    transaction_type=models.CharField(max_length=200,choices=TRANSACTION_TYPES)
