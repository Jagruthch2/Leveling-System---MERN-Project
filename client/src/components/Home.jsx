import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [editorLoading, setEditorLoading] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);

  const handleEditorMode = () => {
    setEditorLoading(true);
    setTimeout(() => {
      navigate('/editor');
    }, 2000);
  };

  const handlePlayerMode = () => {
    setPlayerLoading(true);
    setTimeout(() => {
      navigate('/player');
    }, 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col">
      {/* Header with logout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base sm:text-lg">S</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Shadow System</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Welcome message */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-blue-400 mb-2 sm:mb-4">
            Welcome, {user?.username || 'Shadow Hunter'}!
          </h2>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-md mx-auto px-2">
            Choose your path in the Shadow System
          </p>
          <div className="mt-2 sm:mt-4 flex justify-center">
            <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Mode selection buttons */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 w-full max-w-4xl">
          {/* Editor Mode Button */}
          <div className="flex-1">
            <button
              onClick={handleEditorMode}
              disabled={editorLoading || playerLoading}
              className={`group relative w-full h-32 sm:h-40 md:h-48 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                editorLoading || playerLoading 
                  ? 'cursor-not-allowed opacity-50 scale-95' 
                  : 'hover:scale-105 hover:shadow-blue-500/25 animate-pulse hover:animate-none'
              }`}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent transition-opacity duration-300 ${
                editorLoading || playerLoading ? 'opacity-30' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
              
              {/* Border glow */}
              <div className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-300 ${
                editorLoading || playerLoading 
                  ? 'border-blue-400/20' 
                  : 'border-blue-400/30 group-hover:border-blue-400/60 group-hover:shadow-lg group-hover:shadow-blue-400/30'
              }`}></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
                <div className={`mb-2 sm:mb-4 p-2 sm:p-4 bg-blue-500/20 rounded-full transition-all duration-300 ${
                  editorLoading || playerLoading 
                    ? 'bg-blue-400/10' 
                    : 'group-hover:bg-blue-400/30 group-hover:scale-110'
                }`}>
                  {editorLoading ? (
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                </div>
                <h3 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 transition-colors duration-300 ${
                  editorLoading || playerLoading 
                    ? 'text-blue-300' 
                    : 'group-hover:text-blue-200'
                }`}>
                  {editorLoading ? 'Loading Editor...' : 'Editor Mode'}
                </h3>
                <p className={`text-blue-100 text-xs sm:text-sm md:text-base px-2 sm:px-4 text-center transition-colors duration-300 ${
                  editorLoading || playerLoading 
                    ? 'text-blue-200' 
                    : 'group-hover:text-blue-50'
                }`}>
                  {editorLoading ? 'Preparing your workspace...' : 'Create and customize your digital realm'}
                </p>
              </div>
            </button>
          </div>

          {/* Player Mode Button */}
          <div className="flex-1">
            <button
              onClick={handlePlayerMode}
              disabled={editorLoading || playerLoading}
              className={`group relative w-full h-32 sm:h-40 md:h-48 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
                editorLoading || playerLoading 
                  ? 'cursor-not-allowed opacity-50 scale-95' 
                  : 'hover:scale-105 hover:shadow-purple-500/25 animate-pulse hover:animate-none'
              }`}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent transition-opacity duration-300 ${
                editorLoading || playerLoading ? 'opacity-30' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
              
              {/* Border glow */}
              <div className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-300 ${
                editorLoading || playerLoading 
                  ? 'border-purple-400/20' 
                  : 'border-purple-400/30 group-hover:border-purple-400/60 group-hover:shadow-lg group-hover:shadow-purple-400/30'
              }`}></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
                <div className={`mb-2 sm:mb-4 p-2 sm:p-4 bg-purple-500/20 rounded-full transition-all duration-300 ${
                  editorLoading || playerLoading 
                    ? 'bg-purple-400/10' 
                    : 'group-hover:bg-purple-400/30 group-hover:scale-110'
                }`}>
                  {playerLoading ? (
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h3 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 transition-colors duration-300 ${
                  editorLoading || playerLoading 
                    ? 'text-purple-300' 
                    : 'group-hover:text-purple-200'
                }`}>
                  {playerLoading ? 'Loading Player...' : 'Player Mode'}
                </h3>
                <p className={`text-purple-100 text-xs sm:text-sm md:text-base px-2 sm:px-4 text-center transition-colors duration-300 ${
                  editorLoading || playerLoading 
                    ? 'text-purple-200' 
                    : 'group-hover:text-purple-50'
                }`}>
                  {playerLoading ? 'Entering the arena...' : 'Enter the game and test your skills'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            Choose wisely, Shadow Hunter. Your journey awaits...
          </p>
        </div>
      </div>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default Home;
