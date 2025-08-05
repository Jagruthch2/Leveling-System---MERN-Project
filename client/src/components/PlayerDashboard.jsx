import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleShop = () => {
    navigate('/shop-player');
  };

  const handleDailyQuests = () => {
    navigate('/daily-quests');
  };

  const handleSkills = () => {
    navigate('/skills-player');
  };

  const handleDungeonQuests = () => {
    navigate('/dungeon-quests-player');
  };

  const handlePenaltyQuests = () => {
    navigate('/penalty-quests-player');
  };

  const handleProfile = () => {
    navigate('/profile-player');
  };

  const handleRewardsInventory = () => {
    navigate('/rewards-inventory');
  };

  const menuItems = [
    {
      id: 'daily-quests',
      title: 'Daily Quests',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 00.293-.707V7a2 2 0 00-2-2H14m-5 3l2 2 4-4" />
        </svg>
      ),
      onClick: handleDailyQuests,
      bgGradient: 'bg-gradient-to-br from-emerald-600 to-emerald-800',
      hoverBg: 'hover:from-emerald-500 hover:to-emerald-700'
    },
    {
      id: 'skills',
      title: 'Skills',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      onClick: handleSkills,
      bgGradient: 'bg-gradient-to-br from-amber-600 to-amber-800',
      hoverBg: 'hover:from-amber-500 hover:to-amber-700'
    },
    {
      id: 'dungeon-quests',
      title: 'Dungeon Quests',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      onClick: handleDungeonQuests,
      bgGradient: 'bg-gradient-to-br from-rose-600 to-rose-800',
      hoverBg: 'hover:from-rose-500 hover:to-rose-700'
    },
    {
      id: 'penalty-quests',
      title: 'Penalty Quests',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      onClick: handlePenaltyQuests,
      bgGradient: 'bg-gradient-to-br from-red-600 to-red-800',
      hoverBg: 'hover:from-red-500 hover:to-red-700'
    },
    {
      id: 'rewards-inventory',
      title: 'Inventory',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 5l4 4m10-6l-4-4-4 4" />
        </svg>
      ),
      onClick: handleRewardsInventory,
      bgGradient: 'bg-gradient-to-br from-cyan-600 to-cyan-800',
      hoverBg: 'hover:from-cyan-500 hover:to-cyan-700'
    },
    {
      id: 'shop',
      title: 'Shop',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      onClick: handleShop,
      bgGradient: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
      hoverBg: 'hover:from-indigo-500 hover:to-indigo-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToHome}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">P</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Player Mode</h1>
              <p className="text-gray-400 text-xs sm:text-sm">Welcome, {user?.username || 'Shadow Player'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={handleProfile}
            className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-400 mb-2 sm:mb-4">
            Player Dashboard
          </h2>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-md mx-auto px-2">
            Embark on your gaming journey and conquer new challenges
          </p>
          <div className="mt-2 sm:mt-4 flex justify-center">
            <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          </div>
        </div>

        {/* Menu Buttons Grid */}
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`group relative h-28 sm:h-32 md:h-36 ${item.bgGradient} ${item.hoverBg} rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500 animate-pulse hover:animate-none`}
              >
                {/* Border effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white border-opacity-20 group-hover:border-opacity-40 transition-all duration-300"></div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-3 sm:p-4">
                  <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-white bg-opacity-20 rounded-full group-hover:bg-opacity-30 transition-all duration-300 group-hover:scale-110">
                    <div className="w-6 h-6 sm:w-8 sm:h-8">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center group-hover:text-gray-100 transition-colors duration-300">
                    {item.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            Choose your adventure and start building your legend, Shadow Player
          </p>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
