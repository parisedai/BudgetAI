# SplitItUp Backend API Usage Guide

## 🚀 Quick Start

Your Django backend is running in Docker at `http://localhost:8000`

## 📡 API Endpoints

### 1. **GET /receipts/** - List All Receipts
Get a list of all saved receipts.

**Request:**
```bash
curl http://localhost:8000/receipts/
```

**Response:**
```json
[]
```

---

### 2. **POST /upload/** - Upload Receipt Image
Upload a receipt image and get OCR-extracted text and total amount.

**Request:**
```bash
curl -X POST http://localhost:8000/upload/ \
  -F "file=@/path/to/your/receipt.jpg"
```

**Example with a file:**
```bash
curl -X POST http://localhost:8000/upload/ \
  -F "file=@receipt.png"
```

**Response:**
```json
{
  "raw_text": "WALMART\nStore #1234\n...",
  "total_amount": "28.57"
}
```

**Using Postman/Insomnia:**
- Method: POST
- URL: `http://localhost:8000/upload/`
- Body: form-data
- Key: `file` (type: File)
- Value: Select your receipt image

---

### 3. **POST /split/** - Split Expenses
Calculate fair expense split between people.

**Request:**
```bash
curl -X POST http://localhost:8000/split/ \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"name": "Pizza", "amount": "15.99"},
      {"name": "Drinks", "amount": "8.50"}
    ],
    "people": ["Alice", "Bob", "Charlie"]
  }'
```

**Response:**
```json
{
  "split": {
    "Alice": 8.16,
    "Bob": 8.16,
    "Charlie": 8.17
  }
}
```

---

## 🐳 Docker Commands

### Check Status
```bash
cd backend
./check-docker.sh
```

### View Logs
```bash
cd backend
docker-compose logs -f
```

### Stop Container
```bash
cd backend
docker-compose down
```

### Start Container
```bash
cd backend
docker-compose up -d
```

### Restart Container
```bash
cd backend
docker-compose restart
```

---

## 🧪 Testing Examples

### Test 1: List Receipts (Empty)
```bash
curl http://localhost:8000/receipts/
```

### Test 2: Upload Receipt
```bash
# Make sure you have a receipt image file
curl -X POST http://localhost:8000/upload/ \
  -F "file=@/path/to/receipt.jpg"
```

### Test 3: Split Expenses
```bash
curl -X POST http://localhost:8000/split/ \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"name": "Dinner", "amount": "45.50"},
      {"name": "Tax", "amount": "3.64"}
    ],
    "people": ["Person1", "Person2"]
  }'
```

---

## 🌐 Using in Browser

1. **List Receipts:** Open `http://localhost:8000/receipts/`
2. **Upload:** Use Postman, Insomnia, or curl (browsers can't do file uploads directly)

---

## 📝 Notes

- The server runs on port **8000**
- CORS is enabled for localhost and Expo apps
- OCR uses OpenCV and Tesseract for image processing
- All amounts are returned as strings in JSON

---

## 🔧 Troubleshooting

**Container not running?**
```bash
cd backend
docker-compose up -d
```

**View errors:**
```bash
cd backend
docker-compose logs
```

**Rebuild after code changes:**
```bash
cd backend
docker-compose up --build -d
```

