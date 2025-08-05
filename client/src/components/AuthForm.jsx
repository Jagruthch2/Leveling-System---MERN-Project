import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthForm = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  // Simple individual state for each input
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Message state
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Display message with auto-clear
  const showMessage = (text, success = false) => {
    setMessage(text);
    setIsSuccess(success);
    setTimeout(() => {
      setMessage('');
      setIsSuccess(false);
    }, 4000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous message
    setMessage('');
    
    // Basic validation
    if (!username.trim()) {
      showMessage('Please enter a username');
      return;
    }
    
    if (!password) {
      showMessage('Please enter a password');
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      showMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        username: username.trim(),
        password: password
      };

      if (isLogin) {
        await login(userData);
        showMessage('Login successful! Redirecting...', true);
        setTimeout(() => navigate('/home'), 2000);
      } else {
        await signup(userData);
        showMessage('Account created successfully! Redirecting...', true);
        setTimeout(() => navigate('/home'), 2000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.message) {
        showMessage(error.message);
      } else {
        showMessage('Invalid login details. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setMessage('');
    setIsSuccess(false);
  };

  // Fill test credentials
  const fillTestCredentials = () => {
    setUsername('shadow_hunter');
    setPassword('hunterX2025');
    if (!isLogin) {
      setConfirmPassword('hunterX2025');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 border-opacity-50 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">S</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">
            Shadow System
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            {isLogin ? 'Welcome back, Shadow Hunter' : 'Join the elite gamers'}
          </p>
        </div>

        {/* Signup Instructions - Only show during signup */}
        {!isLogin && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-600 bg-opacity-20 rounded-lg border border-blue-500 border-opacity-50">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-blue-300 font-semibold text-sm sm:text-base mb-1 sm:mb-2">Sign Up Instructions</h4>
                <ul className="text-blue-200 text-xs sm:text-sm space-y-1">
                  <li>• Choose a unique username (3-20 characters)</li>
                  <li>• Password must be at least 6 characters long</li>
                  <li>• Your account will give you access to skills, quests, and rewards</li>
                  <li>• You can switch between Editor and Player modes</li>
                  <li>• All your progress will be saved automatically</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Message Display Area - Always visible */}
        <div className="mb-4 sm:mb-6 min-h-[50px] sm:min-h-[60px] flex items-center justify-center">
          {message && (
            <div className={`w-full p-3 sm:p-4 rounded-lg text-center font-medium transition-all duration-300 text-sm sm:text-base ${
              isSuccess 
                ? 'bg-green-600 bg-opacity-20 text-green-400 border border-green-500 border-opacity-50' 
                : 'bg-red-600 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Login/Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username {!isLogin && <span className="text-blue-400 text-xs">(3-20 characters)</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? "Enter your username" : "Choose a unique username (e.g., shadow_warrior_123)"}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 bg-opacity-90 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:bg-gray-800 text-sm sm:text-base"
                disabled={isSubmitting}
                autoComplete="username"
                minLength={isLogin ? undefined : 3}
                maxLength={isLogin ? undefined : 20}
                required
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 bg-opacity-20 to-purple-600 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {!isLogin && username.trim() && username.length < 3 && (
              <p className="mt-1 text-xs text-yellow-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Username must be at least 3 characters long
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password {!isLogin && <span className="text-blue-400 text-xs">(minimum 6 characters)</span>}
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Enter your password" : "Create a secure password (min 6 chars)"}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 bg-opacity-90 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:bg-gray-800 text-sm sm:text-base"
                disabled={isSubmitting}
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? undefined : 6}
                required
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 bg-opacity-20 to-purple-600 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {!isLogin && password.trim() && password.length < 6 && (
              <p className="mt-1 text-xs text-yellow-400 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* Confirm Password Input - Only for Signup */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password to confirm"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 bg-opacity-90 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:bg-gray-800 text-sm sm:text-base"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 bg-opacity-20 to-purple-600 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {confirmPassword.trim() && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-4 sm:mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium text-sm sm:text-base"
            disabled={isSubmitting}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Test Credentials - Only show during login */}
        {isLogin && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 border-opacity-50">
            <div className="text-center">
              <p className="text-gray-300 text-xs sm:text-sm mb-2">
                <strong>Test Credentials:</strong>
              </p>
              <p className="text-gray-400 text-xs mb-2 sm:mb-3">
                Username: shadow_hunter<br />
                Password: hunterX2025
              </p>
              <button
                type="button"
                onClick={fillTestCredentials}
                className="px-3 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white text-xs rounded transition-all duration-300 transform hover:scale-105"
                disabled={isSubmitting}
              >
                Fill Test Credentials
              </button>
            </div>
          </div>
        )}

        {/* Signup Benefits - Only show during signup */}
        {!isLogin && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-600 bg-opacity-20 rounded-lg border border-purple-500 border-opacity-50">
            <div className="text-center">
              <h4 className="text-purple-300 font-semibold text-sm sm:text-base mb-2">What You'll Get</h4>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-purple-200">
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Skills Tracking</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Daily Quests</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Rewards System</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Progress Saving</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 bg-opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-cyan-500 bg-opacity-10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '500ms'}}></div>
      </div>
    </div>
  );
};

export default AuthForm;
