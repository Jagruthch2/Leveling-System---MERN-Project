# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Option 1: Start Both Servers Simultaneously (Recommended)

1. **Install all dependencies:**
```bash
npm run install:all
```

2. **Start both backend and frontend:**
```bash
npm run dev
```

This will start:
- Backend server at `http://localhost:5000`
- Frontend server at `http://localhost:5173`

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

## 🔧 Environment Setup

Create a `.env` file in the `server` directory with:

```env
MONGO_URI=your-mongodb-connection-string
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d
```

## 🎮 Using the App

1. **Open** `http://localhost:5173` in your browser
2. **Sign Up** with a new username and password
3. **Login** with your credentials
4. **Explore** the dashboard after successful authentication

## 🛠️ Available Scripts

### Root Directory
- `npm run dev` - Start both servers in development mode
- `npm run install:all` - Install dependencies for all packages
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend server

### Server Directory
- `npm run dev` - Start backend with nodemon (auto-restart)
- `npm start` - Start backend in production mode

### Client Directory
- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔍 Testing the API

You can test the API endpoints using tools like Postman or curl:

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running locally OR
   - Update `MONGO_URI` in `.env` with your MongoDB Atlas connection string

2. **Port Already in Use:**
   - Change `PORT` in server `.env` file
   - Update API URL in client `authService.js`

3. **CORS Errors:**
   - Ensure backend is running on port 5000
   - Check if frontend is accessing the correct API URL

4. **JWT Token Issues:**
   - Clear localStorage in browser
   - Check if `JWT_SECRET` is set in `.env`

### Need Help?

Check the main README.md for detailed documentation and troubleshooting guides.
