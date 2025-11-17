# SplitItUp Frontend

Next.js frontend for the SplitItUp application.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Django backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Create .env.local file (optional, defaults to http://localhost:8000)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
frontend/
├── app/              # Next.js app directory
│   ├── page.tsx      # Home page (receipt list)
│   ├── upload/       # Upload receipt page
│   ├── split/        # Split expenses page
│   └── layout.tsx    # Root layout
├── lib/
│   └── api.ts        # API service functions
└── public/           # Static assets
```

## 🎨 Features

- **Home Page**: View all receipts
- **Upload Page**: Upload receipt images for OCR processing
- **Split Page**: Calculate fair expense splits between people

## 🔌 API Integration

The frontend connects to the Django backend API:

- `GET /receipts/` - List all receipts
- `POST /upload/` - Upload receipt image
- `POST /split/` - Split expenses

API base URL can be configured via `NEXT_PUBLIC_API_URL` environment variable.

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 19** - UI library

## 📝 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
