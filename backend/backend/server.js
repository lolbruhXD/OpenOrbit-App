import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import logRoutes from './routes/logRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/PostRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import recommendRoutes from './routes/recommendRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get("/", (req, res) => {
  res.send("Luniva Backend API Running 🚀");
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/log', logRoutes);
app.use('/api/upload', uploadRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_feed', () => {
    socket.join('feed_room');
    console.log('User joined feed room');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to other modules
app.set('io', io);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Force listen on all network interfaces
server.listen(PORT, HOST, () => {
  // Log both the 0.0.0.0 binding and the actual IP for checking
  console.log(`Server bound to all interfaces (0.0.0.0:${PORT})`);
  console.log(`Try connecting to http://10.41.182.148:${PORT}`);
});