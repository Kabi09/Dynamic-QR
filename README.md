# Dynamic URL QR Code Generator

A MERN stack web application that generates **permanent QR codes** with **dynamic destination links**. Update the URL anytime — the QR code never changes.

## How It Works

1. **Create a QR code** with a name, size, and destination URL
2. The QR code points to a **server redirect endpoint** (`/r/abc123`)
3. When scanned, the server **redirects** to your target URL
4. **Edit the URL** anytime — the QR code image stays the same forever

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js + Node.js
- **Database**: MongoDB + Mongoose
- **QR Generation**: `qrcode` library
- **Short IDs**: `nanoid`

## Project Structure

```
├── server/
│   ├── index.js           # Express server + redirect endpoint
│   ├── models/QrCode.js   # Mongoose schema
│   ├── routes/qr.js       # CRUD API routes
│   ├── .env               # PORT, MONGO_URI
│   └── package.json
└── client/
    ├── src/
    │   ├── App.jsx         # Sidebar + routing
    │   ├── pages/
    │   │   ├── CreateQR.jsx   # Create QR form
    │   │   └── ListedQR.jsx   # QR list with edit/delete
    │   ├── index.css       # Dark theme styling
    │   └── main.jsx
    ├── .env                # VITE_API_BASE_URL
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup

### Prerequisites

- Node.js
- MongoDB running on `localhost:27017`

### Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### Environment Variables

**server/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/dynamic-qr
```

**client/.env**
```
VITE_API_BASE_URL=http://localhost:5000
```

### Run

```bash
# Terminal 1 — Backend
cd server
node index.js

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/qr` | Create a new QR code |
| GET | `/api/qr` | List all QR codes |
| PUT | `/api/qr/:id` | Update name or URL |
| DELETE | `/api/qr/:id` | Delete a QR code |
| GET | `/r/:shortId` | Redirect to target URL |

## Features

- **Create QR** — Name, size selector, URL input, QR preview & download
- **Listed QR** — Card grid with inline edit, delete confirmation, download
- **Dynamic Redirect** — QR stays permanent, destination URL is changeable
- **Dark Theme UI** — Glassmorphism, gradients, smooth animations
