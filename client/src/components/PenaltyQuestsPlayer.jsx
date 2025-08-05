import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PenaltyQuestsPlayer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

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
    // Only fetch quests if user is authenticated and loaded
    if (user && localStorage.getItem('token')) {
      fetchQuests();
    } else if (!localStorage.getItem('token')) {
      navigate('/auth');
    }
    
    // Update current time every minute for countdown display
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Check for midnight reset every minute
    const resetInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        // It's midnight, refresh the quests
        if (user && localStorage.getItem('token')) {
          fetchQuests();
        }
      }
    }, 60000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(resetInterval);
    };
  }, [user]); // Add user as dependency

  // Helper function to calculate time until midnight
  const getTimeUntilMidnight = () => {
    const now = currentTime;
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const timeDiff = midnight - now;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

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
        setError('Authentication token not found. Please log in again.');
        navigate('/auth');
        return;
      }

      const response = await axios.get('https://leveling-system-mern-project.onrender.com/api/penalty-quests', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const userQuests = response.data.data || [];
        setQuests(userQuests);
      } else {
        setQuests(response.data || []);
      }
    } catch (error) {
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else {
        setError('Failed to load penalty quests. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPenalty = async (questId) => {
    try {
      setAccepting(questId);
      setError('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        navigate('/auth');
        return;
      }

      // Validate questId
      if (!questId) {
        setError('Invalid quest ID. Please try again.');
        return;
      }

      const response = await axios.patch(
        `https://leveling-system-mern-project.onrender.com/api/penalty-quests/${questId}/accept`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update the quest in the local state to show as completed
        setQuests(prevQuests =>
          prevQuests.map(quest =>
            quest._id === questId
              ? { 
                  ...quest, 
                  isCompletedToday: true,
                  isAccepted: true, 
                  isCompleted: true,
                  lastCompletedAt: new Date().toISOString()
                }
              : quest
          )
        );
        
        // Show success message
        setSuccessMessage(response.data.message || 'Penalty quest completed successfully! XP has been awarded.');
        
        // Clear success message after 8 seconds
        setTimeout(() => setSuccessMessage(''), 8000);
      } else {
        setError(response.data.message || 'Failed to complete penalty quest');
      }
    } catch (error) {
      console.error('Error accepting penalty:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.status === 403) {
        setError('Access denied. You can only complete your own penalty quests.');
      } else if (error.response?.status === 404) {
        setError('Penalty quest not found. Please refresh the page.');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || 'You have already completed this quest today.');
      } else {
        setError(error.response?.data?.message || 'Failed to complete penalty quest. Please try again.');
      }
      
      // Clear error message after 8 seconds
      setTimeout(() => setError(''), 8000);
    } finally {
      setAccepting(null);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-300">
                Penalty Quests
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-4 tracking-wide">
                Penalty Realm
              </h2>
              <p className="text-blue-300 text-lg font-medium">
                Complete Your Personal Penalty Quests
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-300">
                  Your Penalty Quests ({quests.filter(quest => !quest.isCompletedToday && !quest.isAccepted && !quest.isCompleted).length})
                </h3>
                <p className="text-blue-400 text-sm font-medium">
                  Complete your penalty quests • Daily reset at 12:00 AM • {currentTime.toLocaleDateString()}
                </p>
              </div>
            </div>

            {successMessage && (
              <div className="mb-6 relative z-10">
                <div className="bg-green-900/40 border border-green-400/50 rounded-lg p-4 max-w-lg mx-auto shadow-lg shadow-green-500/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-green-300 font-medium">{successMessage}</p>
                      <p className="text-green-400 text-xs mt-1">💡 This quest will be available again tomorrow at 12:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 relative z-10">
                <div className="bg-red-900/40 border border-red-400/50 rounded-lg p-4 max-w-md mx-auto shadow-lg shadow-red-500/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-300 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-300 font-medium">Loading your penalty quests...</p>
              </div>
            ) : quests.filter(quest => !quest.isCompletedToday && !quest.isAccepted && !quest.isCompleted).length === 0 ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30 mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {quests.length === 0 ? (
                  <>
                    <p className="text-blue-300 text-xl font-semibold">No Penalty Quests Available</p>
                    <p className="text-blue-400 font-medium mb-2">
                      You haven't created any penalty quests yet.
                    </p>
                    <p className="text-cyan-300 text-sm mb-4">
                      💡 Create penalty quests to challenge yourself daily
                    </p>
                    <button
                      onClick={() => navigate('/editor')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-bold border border-blue-500/50 shadow-lg hover:shadow-blue-500/50 backdrop-blur-sm"
                    >
                      Create Penalty Quests
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-blue-300 text-xl font-semibold">All Penalty Quests Completed! 🎉</p>
                    <p className="text-blue-400 font-medium mb-2">
                      You've completed all your penalty quests for today.
                    </p>
                    <p className="text-cyan-300 text-sm mb-4">
                      💡 Penalty quests will be available again tomorrow at 12:00 AM ({getTimeUntilMidnight()} remaining)
                    </p>
                    <button
                      onClick={() => navigate('/player')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-bold border border-blue-500/50 shadow-lg hover:shadow-blue-500/50 backdrop-blur-sm"
                    >
                      Back to Dashboard
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {quests
                  .filter((quest) => {
                    // Hide completed quests until next day
                    const isCompletedToday = quest.isCompletedToday || quest.isAccepted || quest.isCompleted;
                    return !isCompletedToday;
                  })
                  .map((quest) => {
                    const isCompletedToday = quest.isCompletedToday || quest.isAccepted || quest.isCompleted;
                    const timeUntilReset = isCompletedToday ? getTimeUntilMidnight() : null;
                  
                  return (
                    <div
                      key={quest._id}
                      className={`relative p-6 rounded-lg border transition-all duration-300 shadow-lg backdrop-blur-sm ${
                        isCompletedToday
                          ? 'bg-green-900/20 border-green-500/40 shadow-green-500/10 opacity-75'
                          : 'bg-slate-800/60 border-blue-600/50 hover:border-cyan-500/70 shadow-blue-500/10'
                      }`}
                    >
                      {/* Completion Badge */}
                      {isCompletedToday && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-green-600/80 text-green-100 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 border border-green-400/50 shadow-lg backdrop-blur-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>COMPLETED</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quest Info */}
                        <div className="flex-1 space-y-3">
                          {/* Quest Title */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                              isCompletedToday
                                ? 'bg-green-500 border-green-400'
                                : 'border-blue-400 bg-slate-700/50'
                            }`}>
                              {isCompletedToday ? (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <h4 className={`font-bold text-xl flex items-center ${
                              isCompletedToday ? 'text-green-400' : 'text-blue-300'
                            }`}>
                              <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {quest.name || 'Unnamed Penalty Quest'}
                              {isCompletedToday && (
                                <span className="ml-2 text-green-500 text-lg">✓</span>
                              )}
                            </h4>
                          </div>

                          {/* Quest Details */}
                          <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span className={`font-semibold ${isCompletedToday ? 'text-green-300' : 'text-blue-300'}`}>
                                +{quest.xp || 0} XP
                              </span>
                            </div>

                            {quest.skill && (
                              <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span className={`font-medium ${isCompletedToday ? 'text-green-300' : 'text-blue-300'}`}>
                                  {getDisplayName(quest.skill)}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className={`font-medium ${isCompletedToday ? 'text-green-300' : 'text-blue-300'}`}>
                                Penalty Quest
                              </span>
                            </div>
                          </div>

                          {/* Reset Timer */}
                          {isCompletedToday && timeUntilReset && (
                            <div className="mt-3 pt-3 border-t border-green-600/30">
                              <div className="flex items-center space-x-2 text-sm">
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-green-300 font-medium">
                                  Available again in: {timeUntilReset}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          {isCompletedToday ? (
                            <div className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold backdrop-blur-sm flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Completed Today</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAcceptPenalty(quest._id)}
                              disabled={accepting === quest._id}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-200 font-semibold border border-blue-500/50 shadow-lg hover:shadow-blue-500/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {accepting === quest._id ? (
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltyQuestsPlayer;
