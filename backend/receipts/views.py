from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from decimal import Decimal
from .models import Receipt
from .serializers import ReceiptSerializer, UploadResponseSerializer, SplitRequestSerializer, SplitResponseSerializer
from .ocr import process_receipt_image


@api_view(['GET'])
def api_root(request):
    """
    API root endpoint - lists all available endpoints
    """
    return Response({
        'message': 'BudgetAI Backend API',
        'version': '1.0',
        'endpoints': {
            'upload': {
                'url': '/upload/',
                'method': 'POST',
                'description': 'Upload a receipt image for OCR processing',
                'example': 'curl -X POST http://localhost:8000/upload/ -F "file=@receipt.jpg"'
            },
            'split': {
                'url': '/split/',
                'method': 'POST',
                'description': 'Split expenses between people',
                'example': 'curl -X POST http://localhost:8000/split/ -H "Content-Type: application/json" -d \'{"items": [{"amount": "25.50"}], "people": ["Alice", "Bob"]}\''
            },
            'receipts': {
                'url': '/receipts/',
                'method': 'GET',
                'description': 'Get list of all receipts',
                'example': 'curl http://localhost:8000/receipts/'
            },
            'admin': {
                'url': '/admin/',
                'method': 'GET',
                'description': 'Django admin interface'
            }
        }
    })


class UploadReceiptView(APIView):
    """
    POST /upload/
    Accepts an image file upload, runs OCR using OpenCV and pytesseract,
    and returns JSON { raw_text, total_amount }
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        file = request.FILES['file']
        
        try:
            # Process image with OCR
            raw_text, total_amount = process_receipt_image(file)
            
            # If total_amount is None, set a default or handle error
            if total_amount is None:
                total_amount = Decimal('0.00')
            
            serializer = UploadResponseSerializer({
                'raw_text': raw_text,
                'total_amount': total_amount
            })
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': f'OCR processing failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SplitExpenseView(APIView):
    """
    POST /split/
    Accepts a list of items + list of people, returns a fair expense split
    """
    def post(self, request, format=None):
        serializer = SplitRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        items = serializer.validated_data['items']
        people = serializer.validated_data['people']
        
        if not items:
            return Response(
                {'error': 'Items list cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not people:
            return Response(
                {'error': 'People list cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate total amount from items
        total_amount = Decimal('0.00')
        for item in items:
            # Expect items to have 'amount' or 'price' field
            amount_str = item.get('amount') or item.get('price', '0')
            try:
                total_amount += Decimal(str(amount_str))
            except (ValueError, TypeError):
                continue
        
        # Calculate split per person
        num_people = len(people)
        if num_people == 0:
            return Response(
                {'error': 'At least one person is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        amount_per_person = total_amount / Decimal(str(num_people))
        
        # Create split dictionary
        split = {}
        for person in people:
            split[person] = float(amount_per_person)
        
        # Handle rounding - add remainder to first person
        total_split = sum(split.values())
        if total_split != float(total_amount):
            remainder = float(total_amount) - total_split
            if people:
                split[people[0]] += remainder
        
        response_serializer = SplitResponseSerializer({'split': split})
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class ReceiptListView(APIView):
    """
    GET /receipts/
    Returns a list of all receipts
    """
    def get(self, request, format=None):
        receipts = Receipt.objects.all()
        serializer = ReceiptSerializer(receipts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
