import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DungeonQuestsPlayer = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Helper functions for skill name handling
  const getDisplayName = (fullSkillName) => {
    if (!fullSkillName) return '';
    // Remove the last 4 characters and hyphen from the skill name for display
    // This handles both digits and alphanumeric characters (like 31f1)
    const match = fullSkillName.match(/^(.+)-(.{4})$/);
    return match ? match[1] : fullSkillName;
  };

  const getFullSkillName = (displayName) => {
    if (!displayName || !user?.id) return displayName;
    // Get last 4 digits of user ID
    const userIdSuffix = user.id.slice(-4);
    return `${displayName.trim()}-${userIdSuffix}`;
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fetchQuests = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.get('https://leveling-system-mern-project.onrender.com/api/dungeon-quests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setQuests(response.data.data || []);
      } else {
        setQuests(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching dungeon quests:', error);
      setError('Failed to load dungeon quests. Please try again.');
      
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      setCompleting(questId);
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.patch(
        `https://leveling-system-mern-project.onrender.com/api/dungeon-quests/${questId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update the quest in the local state
        setQuests(prevQuests =>
          prevQuests.map(quest =>
            quest._id === questId
              ? { ...quest, isCompleted: true }
              : quest
          )
        );

        // Show success message with detailed information
        const { quest, updatedProfile } = response.data.data;
        setSuccessMessage(
          `🎉 Quest completed! You earned ${quest.xp} XP, ${quest.coins} coins, and the title "${updatedProfile.newTitle}". Your ${getDisplayName(updatedProfile.skillProgress.skill)} skill is now level ${updatedProfile.skillProgress.level}!`
        );

        // Update user context with new data
        if (user) {
          updateUser({
            ...user,
            totalXp: updatedProfile.totalXp,
            coins: updatedProfile.coins,
            titles: updatedProfile.newTitle ? [
              ...(user.titles || []), 
              { name: updatedProfile.newTitle, source: 'dungeon_quest', awardedAt: new Date() }
            ] : user.titles || []
          });
        }

        // Clear success message after 8 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 8000);
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      
      let errorMessage = 'Failed to complete quest. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        navigate('/auth');
        return;
      }
      
      setError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black flex flex-col relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 via-transparent to-cyan-900/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10 bg-slate-900/30 backdrop-blur-sm border-b border-blue-500/30">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/player')}
            className="p-2 bg-blue-800/60 hover:bg-blue-700/80 rounded-lg transition-all duration-200 border border-blue-600/50 shadow-lg hover:shadow-blue-500/25 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg flex items-center justify-center shadow-lg border border-blue-500/50 backdrop-blur-sm">
              <svg className="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-300">
                Dungeon Quests
              </h1>
              <p className="text-blue-400 text-sm font-medium">
                Hunter {user?.username || 'Shadow Hunter'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all duration-200 font-bold border border-red-500/50 shadow-lg hover:shadow-red-500/50 backdrop-blur-sm flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>

      <div className="flex-1 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-blue-900/10 rounded-2xl blur-xl"></div>
            <div className="relative z-10 p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30">
                  <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-4 tracking-wide">
                Dungeon Realm
              </h2>
              <p className="text-blue-300 text-lg font-medium">
                Forge Your Legend Through Strategic Challenges
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 relative">
              <div className="bg-emerald-900/40 border border-emerald-400/50 rounded-lg p-4 max-w-4xl mx-auto shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-emerald-300 font-medium">{successMessage}</p>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="ml-auto text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 relative">
              <div className="bg-red-900/40 border border-red-400/50 rounded-lg p-4 max-w-4xl mx-auto shadow-lg shadow-red-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-300 font-medium">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="ml-auto text-red-400 hover:text-red-300 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quests List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-blue-600/50 p-6 relative overflow-hidden">
            {/* Subtle Border Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600"></div>
            </div>

            <div className="flex items-center justify-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg flex items-center justify-center shadow-lg border border-blue-500/30 mr-4">
                <svg className="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-300">
                Your Quests ({quests.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-300 font-medium">Loading your quests...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 relative z-10">
                <div className="bg-red-900/40 border border-red-400/50 rounded-lg p-6 max-w-md mx-auto shadow-lg shadow-red-500/20 backdrop-blur-sm">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-300 font-medium mb-2">Error Loading Quests</p>
                  <p className="text-red-200 text-sm mb-4">{error}</p>
                  <button
                    onClick={fetchQuests}
                    className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-bold border border-red-500/50 shadow-lg hover:shadow-red-500/50 backdrop-blur-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : quests.length === 0 ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30 mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <p className="text-blue-300 text-xl font-semibold">No Quests Found</p>
                <p className="text-blue-400 font-medium mb-4">
                  You haven't created any dungeon quests yet. Visit Editor Mode to create your first quest!
                </p>
                <button
                  onClick={() => navigate('/editor')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-bold border border-blue-500/50 shadow-lg hover:shadow-blue-500/50 backdrop-blur-sm"
                >
                  Go to Editor Mode
                </button>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {quests.map((quest) => (
                  <div
                    key={quest._id}
                    className={`relative p-6 rounded-lg border transition-all duration-300 shadow-lg backdrop-blur-sm ${
                      quest.isCompleted
                        ? 'bg-emerald-900/30 border-emerald-500/50 shadow-emerald-500/10'
                        : 'bg-slate-800/60 border-blue-600/50 hover:border-cyan-500/70 shadow-blue-500/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Quest Info */}
                      <div className="flex-1 space-y-3">
                        {/* Quest Title */}
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                            quest.isCompleted
                              ? 'bg-emerald-500 border-emerald-400'
                              : 'border-blue-400 bg-slate-700/50'
                          }`}>
                            {quest.isCompleted && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <h4 className={`font-bold text-xl flex items-center ${
                            quest.isCompleted ? 'text-emerald-400 line-through' : 'text-blue-300'
                          }`}>
                            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {quest.name || 'Unnamed Quest'}
                          </h4>
                        </div>

                        {/* Quest Details */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span className="text-blue-300 font-semibold">{quest.xp || 0} XP</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-blue-300 font-semibold">{quest.coins || 0} Coins</span>
                          </div>

                          {quest.skill && (
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span className="text-blue-300 font-medium">{getDisplayName(quest.skill)}</span>
                            </div>
                          )}

                          {quest.title && (
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              <span className="text-blue-300 font-medium">{quest.title}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        {quest.isCompleted ? (
                          <div className="px-6 py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 font-semibold backdrop-blur-sm flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Completed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCompleteQuest(quest._id)}
                            disabled={completing === quest._id}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-semibold border border-blue-500/50 shadow-lg hover:shadow-blue-500/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {completing === quest._id ? (
                              <>
                                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Completing...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Complete</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DungeonQuestsPlayer;
