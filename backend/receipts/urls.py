from django.urls import path
from .views import UploadReceiptView, SplitExpenseView, ReceiptListView

urlpatterns = [
    path('upload/', UploadReceiptView.as_view(), name='upload-receipt'),
    path('split/', SplitExpenseView.as_view(), name='split-expense'),
    path('receipts/', ReceiptListView.as_view(), name='receipt-list'),
]

