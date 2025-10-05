import re
from flask import Flask, render_template, request, redirect
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Temporary storage for manually added expenses
expenses = []
# Temporary storage for last parsed expenses from upload
last_parsed_expenses = []

# --- Receipt Parsing Function ---
def parse_receipt_text_to_expenses(raw_text, expenses):
    ignore_keywords = [
        "subtotal", "total", "tax", "change due", "page", "walmart", "mgr", "st#", "op#", "te#", "tr#", "tend", "credit", "items sold", "tc#", "date", "https://", "lb @", "@", "bottle deposit", "cash", "discover", "visa", "mastercard", "debit", "balance", "payment", "sold", "order", "amount", "tender", "ref", "auth", "approval", "rounding", "fee", "service", "tip", "loyalty", "points", "earned", "redeemed", "remaining", "member", "club", "rewards"
    ]
    category_map = {
        "gv": "Grocery",
        "caramel": "Food",
        "tuna": "Grocery",
        "mozz": "Grocery",
        "rotis": "Food",
        "chkn": "Food",
        "carrot": "Grocery",
        "apple": "Grocery",
        "banana": "Grocery",
        "pizza": "Food",
        "cheese": "Grocery",
        "coffee": "Grocery",
        # Add more mappings as needed
    }
    date_pattern = re.compile(r'\d{1,2}/\d{1,2}/\d{2,4}')
    time_pattern = re.compile(r'\d{1,2}:\d{2}')
    for line in raw_text.split('\n'):
        line_lower = line.lower().strip()
        if not line_lower or any(kw in line_lower for kw in ignore_keywords):
            continue
        if date_pattern.search(line_lower) or time_pattern.search(line_lower):
            continue
        # Ignore lines with numbers longer than 12 digits (likely codes)
        if any(len(num) > 12 for num in re.findall(r'\d+', line)):
            continue
        # Find the last number in the line as the price (must be reasonable)
        numbers = re.findall(r'\d+[\.\,]?\d*', line)
        if not numbers:
            continue
        amount_str = numbers[-1].replace(',', '')
        try:
            amount = float(amount_str)
            # Ignore prices that are too large or zero
            if amount <= 0 or amount > 500:
                continue
        except ValueError:
            continue
        # Remove the price from the line to get the item name
        item = re.sub(r'\d+[\.\,]?\d*$', '', line).strip(' -:')
        # Remove trailing codes (e.g., F, numbers)
        item = re.sub(r'\s*[A-Z]?\s*\d{6,}\s*[A-Z]?$','', item).strip()
        # Only add if item name is not empty and not just a code
        if item and not re.match(r'^\d+$', item):
            expenses.append({
                "item": item,
                "amount": amount,
                "category": category_map.get(item.lower().split()[0], "Other")
            })

# --- Home Page (Add Expense) ---
@app.route("/")
def home():
    # Show both manually added and last parsed expenses
    all_expenses = expenses + last_parsed_expenses
    return render_template("index.html", expenses=all_expenses)

@app.route("/add", methods=["POST"])
def add_expense():
    item = request.form['item']
    amount = float(request.form['amount'])
    category = request.form['category']

    expenses.append({
        "item": item,
        "amount": amount,
        "category": category
    })

    return redirect("/")

# --- Upload Page ---
@app.route("/upload", methods=["POST"])
def upload_file():
    global last_parsed_expenses
    file = request.files["receipt"]
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    ocr_text = ""
    try:
        if filename.lower().endswith('.pdf'):
            images = convert_from_path(filepath)
            for i, image in enumerate(images):
                page_text = pytesseract.image_to_string(image)
                ocr_text += f"\n--- Page {i+1} ---\n{page_text}\n"
        else:
            image = Image.open(filepath)
            ocr_text = pytesseract.image_to_string(image)
    except Exception as e:
        ocr_text = f"Error processing file: {e}"

    # Only include purchased items (ignore unwanted lines)
    last_parsed_expenses.clear()
    parse_receipt_text_to_expenses(ocr_text, last_parsed_expenses)

    return redirect("/")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
