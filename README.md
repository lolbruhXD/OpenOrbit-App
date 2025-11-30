# 🪐 OpenOrbit (Project CodersFlow)

A clean, modern platform where developers can share projects, talk about ideas, and look through code in a scrollable mobile feed. It fills the gap between code‑hosting platforms and social apps by highlighting mid‑stage projects that deserve visibility.

---

## 📌 Table of Contents
- About the Project  
- Key Features  
- Tech Stack  
- System Architecture  
- Project Structure  
- Getting Started  
- Prerequisites  
- Backend Setup  
- Frontend Setup  
- Environment Variables  
- API Reference  
- The Recommendation Engine  
- AI Integration  
- Contributing  
- License  

---

## 🔭 About the Project

OpenOrbit (previously CodersFlow) was built as part of the IIITM Gwalior hackathon. It focuses on giving developers a place to show practical work that isn’t quite finished yet but still worth exploring.

The platform blends a visual feed, real-time chat, media previews, and an integrated AI helper.

**Core Value:**
- **Discover:** Scroll through project cards with images, videos, and PDFs.  
- **Connect:** Talk through comments and real-time chat powered by websockets.  
- **Learn:** Ask the built-in AI assistant to explain code on the spot.

---

## 🌟 Key Features

### 📱 Core Experience
- Endless scrolling feed built for smooth performance  
- Media tiles that support images, MP4 videos, and PDFs (via Cloudinary)  
- Topic filters to sort posts by tech stack  
- Dark UI designed around black and deep gray  

### ⚡ Real-Time Interaction
- Live feed refresh using Socket.io  
- Slide-up comments panel using PanResponder  
- Soft, physics-style animations on interactive elements  

### 🤖 Intelligence Layer
- Gemini-powered AI helper for code questions  
- Feed curation handled by a hybrid setup: Python + Node.js  

---

## 🛠 Tech Stack

### **Frontend (Mobile)**
| Technology | Description |
|-----------|-------------|
| React Native | Cross-platform UI |
| Expo SDK | Build tools and native modules |
| TypeScript | Static typing |
| Expo Router | File-based routing |
| Axios | HTTP client |
| Socket.io-Client | Real-time communication |

### **Backend (API)**
| Technology | Description |
|-----------|-------------|
| Node.js | Runtime |
| Express.js | REST API framework |
| MongoDB | Database (Atlas) |
| Mongoose | ODM |
| Python | Feed curation logic |
| Python-Shell | Node → Python bridge |

### **DevOps & Tools**
- Cloudinary (media hosting)  
- Gemini API (AI features)  
- Git/GitHub (version control)

---

## 🏗 System Architecture

OpenOrbit uses a client-server setup with a separate service dedicated to feed curation.

- **Client (React Native):** Handles UI, navigation, media, and sockets  
- **API Server (Node/Express):** Auth, CRUD, file links, websocket events  
- **MongoDB:** Stores users, posts, comments  
- **Compute Layer:**  
  - Node.js manages I/O  
  - Python handles data scoring and sorting for personalized feeds  

---

## 📂 Project Structure

```plaintext
OpenOrbit/
├── backend/backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── frontend2/Frontend/
    ├── app/
    ├── components/
    ├── services/
    ├── assets/
    └── constants/
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)  
- npm or yarn  
- Python 3+  
- Expo Go app or a device emulator  

---

## 🖥 Backend Setup

```bash
cd backend/backend
npm install
npm run dev
```

Server defaults to **port 5000**.

---

## 📱 Frontend Setup

```bash
cd frontend2/Frontend
npm install
npx expo start
```

Scan the QR code using Expo Go.

---

## 🔐 Environment Variables

### **Backend — `backend/backend/.env`**
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/openorbit
JWT_SECRET=your_super_secret_key_123
GEMINI_API_KEY=your_google_ai_studio_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_cloud_secret

HOST=0.0.0.0
```

### **Frontend — `frontend2/Frontend/.env`**
```
EXPO_PUBLIC_DEV_HOST_IP=192.168.x.x
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:5000/api
```

---

## 📡 API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/users/register | Register a new user | No |
| POST | /api/users/login | Login and get token | No |
| GET | /api/posts/feed | Fetch main feed | Yes |
| POST | /api/posts | Create a post | Yes |
| POST | /api/agent/ask | Query the AI helper | Yes |
| GET | /api/recommend/posts | Get curated posts | Yes |

---

## 🧠 The Recommendation Engine [WIP] [Not Implemented Yet]

A Python script placed in  
`backend/backend/utils/recommend.py`

Steps:
1. Node.js launches the Python script through python-shell  
2. User and post data are sent in JSON form  
3. Python calculates a score based on tags and past actions  
4. Sorted post IDs go back to Node  
5. Node sends the ordered feed to the mobile app  

---

## 🤖 AI Integration

Powered by the Google Gemini model through the `@google/generative-ai` SDK.

- Controller file: `agentController.js`  
- Accepts a prompt and optional code context  
- Returns markdown-ready explanations  

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch  
3. Commit your work  
4. Push the branch  
5. Open a pull request  

All contributions are welcome.

---

## 📄 License

This project is under the **MIT License**.

<p align="center">
Built with ❤️ by the OpenOrbit Team for the IIITM Gwalior Hackathon.
</p>
