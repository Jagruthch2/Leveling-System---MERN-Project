import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-block p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">S</span>
                  </div>
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <h1 className="text-lg sm:text-xl font-bold text-cyan-400">
                  Shadow System
                </h1>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-white text-sm sm:text-base">
                <span className="text-slate-400">Welcome back, </span>
                <span className="font-semibold text-blue-400">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">
            Welcome to the Dashboard
          </h2>
          <p className="text-lg sm:text-xl text-slate-400">
            You've successfully logged into Shadow System
          </p>
        </div>

        {/* User Info Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">Profile Information</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-slate-700/50 gap-1 sm:gap-0">
                <span className="text-slate-400 font-medium text-sm sm:text-base">User ID:</span>
                <span className="text-white font-mono text-xs sm:text-sm break-all">{user?.id}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-slate-700/50 gap-1 sm:gap-0">
                <span className="text-slate-400 font-medium text-sm sm:text-base">Username:</span>
                <span className="text-white font-semibold text-sm sm:text-base">{user?.username}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-slate-700/50 gap-1 sm:gap-0">
                <span className="text-slate-400 font-medium text-sm sm:text-base">Account Created:</span>
                <span className="text-white text-sm sm:text-base">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 gap-1 sm:gap-0">
                <span className="text-slate-400 font-medium text-sm sm:text-base">Status:</span>
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20 w-fit">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Authentication</h3>
            <p className="text-slate-400 text-sm">Your account is protected with industry-standard security measures.</p>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-slate-400 text-sm">Experience blazing fast performance with our optimized system.</p>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Scalable</h3>
            <p className="text-slate-400 text-sm">Built to grow with your needs and handle any load.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
