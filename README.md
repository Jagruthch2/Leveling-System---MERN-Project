# Shadow System - Authentication Web App

A complete authentication system with a gaming-inspired UI built with React, Express, and MongoDB.

## 🚀 Features

### 🔒 Backend
- **Express.js** server with MongoDB integration
- **JWT Authentication** with secure token generation
- **Password Hashing** using bcryptjs (12 salt rounds)
- **User Model** with username, hashed password, and timestamps
- **Authentication Routes**: `/api/auth/signup`, `/api/auth/login`, `/api/auth/verify`
- **Protected Routes** with authentication middleware
- **Input Validation** and error handling
- **CORS** enabled for cross-origin requests

### 🎮 Frontend
- **React** with modern hooks and context API
- **Gaming-Inspired UI** with dark blue theme and futuristic design
- **Tailwind CSS** via CDN for responsive styling
- **Animated Transitions** and glowing effects
- **Form Validation** with real-time error feedback
- **Token Management** with localStorage
- **Responsive Design** for desktop and mobile
- **Loading States** and error handling

## 📁 Project Structure

```
shadow-system-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthForm.jsx       # Login/Signup component
│   │   │   ├── Dashboard.jsx      # Protected dashboard
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication state management
│   │   ├── services/
│   │   │   └── authService.js     # API service functions
│   │   ├── App.jsx               # Main app component
│   │   ├── index.css             # Global custom styles
│   │   └── main.jsx              # App entry point
│   ├── index.html                # HTML template with Tailwind CDN
│   └── package.json              # Frontend dependencies
└── server/                 # Express backend
    ├── controllers/              # Route controllers (ready for expansion)
    ├── middleware/
    │   └── auth.js              # JWT authentication middleware
    ├── models/
    │   └── User.js              # User schema and methods
    ├── routes/
    │   └── auth.js              # Authentication routes
    ├── index.js                 # Server entry point
    ├── .env                     # Environment variables
    └── package.json             # Backend dependencies
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
MONGO_URI=your-mongodb-connection-string
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d
```

4. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔐 API Endpoints

### Authentication Routes

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "username": "your-username",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "your-username",
    "createdAt": "2025-01-10T..."
  }
}
```

#### POST `/api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "username": "your-username",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "your-username",
    "createdAt": "2025-01-10T..."
  }
}
```

#### GET `/api/auth/verify`
Verify a JWT token (requires Authorization header).

**Headers:**
```
Authorization: Bearer your-jwt-token
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "username": "your-username",
    "createdAt": "2025-01-10T..."
  }
}
```

## 🎨 UI Features

### Gaming-Inspired Design
- **Dark blue gradient background** with animated particles
- **Glowing input fields** that respond to focus
- **Futuristic buttons** with hover effects
- **Animated loading states** with spinners
- **Card-based layout** with backdrop blur effects
- **Responsive grid system** for different screen sizes

### Form Validation
- **Real-time validation** with immediate feedback
- **Username requirements**: 3-30 characters, unique
- **Password requirements**: minimum 6 characters
- **Confirm password matching** for signup
- **Error highlighting** with red borders and messages
- **Success animations** on form submission

### User Experience
- **Smooth transitions** between login and signup modes
- **Loading states** during authentication
- **Error handling** with user-friendly messages
- **Auto-redirect** to dashboard on successful login
- **Secure logout** with token cleanup
- **Persistent authentication** across browser sessions

## 🔧 Technical Details

### Security Features
- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: Secure token generation with expiration
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Error Handling**: Secure error messages without sensitive data exposure

### State Management
- **React Context**: Centralized authentication state
- **useReducer**: Predictable state updates
- **localStorage**: Persistent token storage
- **Auto-verification**: Token validation on app startup

### Responsive Design
- **Mobile-first approach** with Tailwind CSS via CDN
- **No build process required** for styling - Tailwind loaded from CDN
- **Breakpoint-based layouts** for different screen sizes
- **Touch-friendly interfaces** for mobile devices
- **Flexible grid systems** that adapt to content

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use a production MongoDB instance
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Update CORS settings for production domain

### Frontend Deployment
1. Update API base URL in `authService.js` for production
2. Build the production bundle: `npm run build`
3. Deploy to platforms like Vercel, Netlify, or AWS S3
4. Configure environment variables for production

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions, please create an issue in the repository or contact the development team.

---

Built with ❤️ for the gaming community
