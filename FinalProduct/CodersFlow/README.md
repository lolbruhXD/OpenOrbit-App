# CodersFlow - Complete Social Coding Platform

A full-stack social coding platform with real-time features, authentication, and file upload capabilities.

## 🚀 Features

- **Authentication System**: JWT-based login/register with secure token storage
- **Real-time Posts**: WebSocket-powered live updates for posts, likes, and comments
- **File Upload**: Support for images, documents, and archives
- **Dynamic Feed**: Real MongoDB integration with pagination and filtering
- **Tag System**: Add and filter posts by tags
- **Cross-platform**: Works on Android, iOS, and Web

## 📁 Project Structure

```
CodersFlow/
├── backend/backend/          # Node.js/Express backend
│   ├── controllers/          # API controllers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Auth middleware
│   └── server.js            # Main server file
├── frontend2/Frontend/      # React Native frontend
│   ├── components/          # UI components
│   ├── services/            # API services
│   ├── screens/             # Screen components
│   └── app/                 # Main app entry
└── start-servers.bat        # Quick start script
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Expo CLI
- Android Studio (for Android development)

### 1. Backend Setup

```bash
cd CodersFlow/backend/backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd CodersFlow/frontend2/Frontend
npm install
npm start
```

### 3. Quick Start (Windows)

Double-click `start-servers.bat` to start both servers automatically.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `backend/backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/codersflow
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
HOST=0.0.0.0
```

### API Configuration

Update `frontend2/Frontend/config/api.js` for different environments:

- **Android Emulator**: Use `10.0.2.2:5000`
- **iOS Simulator**: Use `127.0.0.1:5000`
- **Physical Device**: Use your computer's IP address

## 🐛 Troubleshooting

### Common Issues

#### 1. Network Error (AxiosError)
**Problem**: Frontend can't connect to backend
**Solutions**:
- Ensure backend server is running on port 5000
- Check firewall settings
- For Android emulator, use `10.0.2.2` instead of `127.0.0.1`
- For physical device, use your computer's IP address

#### 2. Metro Bundler Issues
**Problem**: InternalBytecode.js not found
**Solution**: The file has been created automatically. If issues persist:
```bash
cd frontend2/Frontend
npx expo start --clear
```

#### 3. MongoDB Connection Issues
**Problem**: Database connection failed
**Solutions**:
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database permissions

#### 4. WebSocket Connection Issues
**Problem**: Real-time features not working
**Solutions**:
- Check if backend WebSocket server is running
- Verify CORS settings
- Check network connectivity

### Development Tips

1. **Hot Reload**: Both servers support hot reload
2. **Logs**: Check console logs for detailed error information
3. **Network**: Use network tab in browser dev tools to debug API calls
4. **Database**: Use MongoDB Compass to view data

## 📱 Mobile Development

### Android
- Use Android Studio emulator
- Update API config to use `10.0.2.2:5000`
- Enable USB debugging for physical devices

### iOS
- Use Xcode simulator
- Update API config to use `127.0.0.1:5000`
- For physical device, use computer's IP address

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token stored in AsyncStorage
3. Token sent with all API requests
4. Protected routes check authentication
5. WebSocket connection established after login

## 📡 Real-time Features

- **New Posts**: Instantly appear in feed
- **Post Updates**: Real-time like/unlike
- **Post Deletions**: Immediate removal from feed
- **User Activity**: Live notifications

## 🚀 Deployment

### Backend Deployment
- Deploy to Heroku, Vercel, or AWS
- Update CORS settings for production
- Set environment variables

### Frontend Deployment
- Build with Expo
- Deploy to app stores
- Update API endpoints for production

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all dependencies are installed
3. Ensure both servers are running
4. Check network connectivity
5. Review console logs for errors

## 🎯 Next Steps

- Add push notifications
- Implement user profiles
- Add comment system
- Create admin panel
- Add search functionality
- Implement post categories
