import re
import cv2
import numpy as np
import pytesseract
from PIL import Image
from decimal import Decimal
from io import BytesIO
from pdf2image import convert_from_bytes


def preprocess_image(image):
    """
    Preprocess image for OCR:
    - Convert to grayscale
    - Apply blur
    - Apply adaptive threshold
    - Apply dilation
    """
    # Convert PIL Image to numpy array if needed
    if isinstance(image, Image.Image):
        img_array = np.array(image)
    else:
        img_array = image
    
    # Convert to grayscale if it's a color image
    if len(img_array.shape) == 3:
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_array
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply adaptive threshold to create binary image
    # This helps with varying lighting conditions
    thresh = cv2.adaptiveThreshold(
        blurred, 
        255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 
        11, 
        2
    )
    
    # Apply dilation to make text thicker and easier to read
    kernel = np.ones((2, 2), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    
    return dilated


def extract_text_from_image(image_file):
    """
    Extract text from an image file or PDF using OCR.
    
    Args:
        image_file: File object (Django UploadedFile) or PIL Image
        
    Returns:
        str: Extracted text from the image/PDF
    """
    try:
        # Handle Django UploadedFile
        if hasattr(image_file, 'read'):
            image_file.seek(0)  # Reset file pointer
            file_content = image_file.read()
            file_extension = getattr(image_file, 'name', '').lower()
            
            # Check if it's a PDF
            if file_extension.endswith('.pdf') or file_content.startswith(b'%PDF'):
                # Convert PDF pages to images
                pdf_images = convert_from_bytes(file_content)
                
                # Process all pages and combine text
                all_text = []
                for i, pdf_image in enumerate(pdf_images):
                    # Convert to RGB if necessary
                    if pdf_image.mode != 'RGB':
                        pdf_image = pdf_image.convert('RGB')
                    
                    # Preprocess the image
                    processed_img = preprocess_image(pdf_image)
                    
                    # Convert back to PIL Image for pytesseract
                    processed_pil = Image.fromarray(processed_img)
                    
                    # Run OCR with pytesseract
                    custom_config = r'--oem 3 --psm 6'
                    page_text = pytesseract.image_to_string(processed_pil, config=custom_config)
                    
                    if page_text.strip():
                        all_text.append(f"\n--- Page {i+1} ---\n{page_text}")
                
                return "\n".join(all_text).strip()
            else:
                # Handle regular image files
                image = Image.open(BytesIO(file_content))
        elif isinstance(image_file, Image.Image):
            image = image_file
        else:
            # Try to open as file path
            image = Image.open(image_file)
        
        # Convert to RGB if necessary (PIL handles this)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess the image
        processed_img = preprocess_image(image)
        
        # Convert back to PIL Image for pytesseract
        processed_pil = Image.fromarray(processed_img)
        
        # Run OCR with pytesseract
        # Use --psm 6 for uniform block of text (receipt format)
        custom_config = r'--oem 3 --psm 6'
        raw_text = pytesseract.image_to_string(processed_pil, config=custom_config)
        
        return raw_text.strip()
    
    except Exception as e:
        raise Exception(f"Error processing image/PDF: {str(e)}")


def extract_total_amount(text):
    """
    Extract total amount from OCR text using regex patterns.
    
    Args:
        text: Raw OCR text string
        
    Returns:
        Decimal: Total amount found, or None if not found
    """
    if not text:
        return None
    
    # Common patterns for total amounts
    patterns = [
        r'total[:\s]*\$?\s*(\d+\.\d{2})',  # "Total: $28.57" or "Total 28.57"
        r'\$?\s*(\d+\.\d{2})\s*$',  # Amount at end of line
        r'amount[:\s]*\$?\s*(\d+\.\d{2})',  # "Amount: $28.57"
        r'grand\s*total[:\s]*\$?\s*(\d+\.\d{2})',  # "Grand Total: $28.57"
        r'balance[:\s]*\$?\s*(\d+\.\d{2})',  # "Balance: $28.57"
        r'\$?\s*(\d+\.\d{2})\s*(?:total|due|paid)',  # "$28.57 total" or "$28.57 due"
    ]
    
    # Try each pattern (case insensitive)
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        if matches:
            # Get the last match (usually the final total)
            try:
                amount = Decimal(matches[-1])
                # Validate reasonable amount (between 0 and 10000)
                if 0 < amount <= 10000:
                    return amount
            except (ValueError, TypeError):
                continue
    
    # Fallback: find all dollar amounts and take the largest
    all_amounts = re.findall(r'\$?\s*(\d+\.\d{2})', text)
    if all_amounts:
        try:
            amounts = [Decimal(amt) for amt in all_amounts]
            # Filter reasonable amounts
            reasonable_amounts = [amt for amt in amounts if 0 < amt <= 10000]
            if reasonable_amounts:
                # Return the largest amount (likely the total)
                return max(reasonable_amounts)
        except (ValueError, TypeError):
            pass
    
    return None


def process_receipt_image(image_file):
    """
    Complete OCR processing pipeline:
    1. Extract text from image or PDF
    2. Extract total amount from text
    
    Args:
        image_file: File object (Django UploadedFile) or PIL Image
                   Supports: JPG, PNG, GIF, PDF
        
    Returns:
        tuple: (raw_text, total_amount)
            raw_text: str - Extracted OCR text
            total_amount: Decimal or None - Extracted total amount
    """
    try:
        # Extract text using OCR (handles both images and PDFs)
        raw_text = extract_text_from_image(image_file)
        
        # Extract total amount from the text
        total_amount = extract_total_amount(raw_text)
        
        return raw_text, total_amount
    
    except Exception as e:
        raise Exception(f"Error processing receipt: {str(e)}")

