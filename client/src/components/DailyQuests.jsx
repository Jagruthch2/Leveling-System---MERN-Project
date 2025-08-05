import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DailyQuests = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for quests
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  
  // State for completion tracking
  const [completedQuests, setCompletedQuests] = useState(new Set());
  const [finishing, setFinishing] = useState(false);
  const [dailyQuestStatus, setDailyQuestStatus] = useState({
    completedToday: new Set(),
    finishedToday: false,
    lastResetDate: null
  });
  
  // State for skills  
  const [skills, setSkills] = useState([]);

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
  const [skillsLoading, setSkillsLoading] = useState(true);
  
  // Message state
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch daily quest completion status from backend
  const fetchDailyQuestStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/daily-quest-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        const { completedQuests, finishedToday, lastResetDate } = response.data.data;
        const completedSet = new Set(completedQuests);
        
        setCompletedQuests(completedSet);
        setDailyQuestStatus({
          completedToday: completedSet,
          finishedToday: finishedToday,
          lastResetDate: lastResetDate
        });
      }
    } catch (error) {
      console.error('Error fetching daily quest status:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      }
      // If error, initialize with empty state
      setCompletedQuests(new Set());
      setDailyQuestStatus({
        completedToday: new Set(),
        finishedToday: false,
        lastResetDate: new Date().toDateString()
      });
    }
  };

  // Fetch quests from backend
  const fetchQuests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/daily-quests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setQuests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else {
        showMessage('Failed to load daily quests');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch skills from backend
  const fetchSkills = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/skills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setSkills(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else {
        showMessage('Failed to load skills. Please create skills first or refresh the page.');
      }
      setSkills([]);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Toggle quest completion
  const toggleQuestCompletion = async (questId) => {
    // Don't allow toggling if quests are already finished for today
    if (dailyQuestStatus.finishedToday) {
      showMessage('Daily quests are already finished for today. Wait for tomorrow\'s reset!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/user/toggle-quest-completion', {
        questId: questId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const { completedQuests, isCompleted } = response.data.data;
        const completedSet = new Set(completedQuests);
        
        setCompletedQuests(completedSet);
        setDailyQuestStatus(prev => ({
          ...prev,
          completedToday: completedSet
        }));
      }
    } catch (error) {
      console.error('Error toggling quest completion:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to update quest completion');
      }
    }
  };

  // Calculate total rewards
  const calculateTotalRewards = () => {
    const completedQuestList = quests.filter(quest => completedQuests.has(quest._id));
    const totalXP = completedQuestList.reduce((sum, quest) => sum + quest.xp, 0);
    const totalCoins = completedQuestList.reduce((sum, quest) => sum + quest.coins, 0);
    return { totalXP, totalCoins, completedCount: completedQuestList.length };
  };

  // Finish daily quests and distribute rewards
  const handleFinishQuests = async () => {
    if (completedQuests.size === 0) {
      showMessage('Please complete at least one quest before finishing.');
      return;
    }

    if (dailyQuestStatus.finishedToday) {
      showMessage('You have already finished today\'s daily quests!');
      return;
    }

    setFinishing(true);
    
    try {
      const completedQuestIds = Array.from(completedQuests);
      const completedQuestList = quests.filter(quest => completedQuestIds.includes(quest._id));
      
      // Calculate rewards
      const { totalXP, totalCoins } = calculateTotalRewards();
      
      // Calculate skill XP for each completed quest
      const skillXPUpdates = {};
      completedQuestList.forEach(quest => {
        if (skillXPUpdates[quest.skill]) {
          skillXPUpdates[quest.skill] += quest.xp;
        } else {
          skillXPUpdates[quest.skill] = quest.xp;
        }
      });

      // Send completion data to backend with skill XP updates
      const response = await axios.post('http://localhost:5000/api/user/complete-daily-quests', {
        completedQuestIds: completedQuestIds,
        totalXP,
        totalCoins,
        skillXPUpdates
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Update skills with the earned XP
        try {
          const skillResponse = await axios.post('http://localhost:5000/api/skills/update-multiple', {
            skillXPUpdates
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (skillResponse.data.success) {
            console.log('Skills updated successfully:', skillResponse.data.data);
            // Refresh skills data to show updated XP
            fetchSkills();
            
            // Enhanced success message with skill level information
            const skillUpdates = skillResponse.data.data.map(skill => 
              `${getDisplayName(skill.name)}: +${skill.xpAdded} XP (Level ${skill.level})`
            ).join(', ');
            
            showMessage(`🎉 Daily quests completed! Earned ${totalXP} XP, ${totalCoins} coins! 📈 Skills updated: ${skillUpdates}`, true);
          } else {
            showMessage(`Daily quests completed! Earned ${totalXP} XP, ${totalCoins} coins! Note: Some skills may not have been updated.`, true);
          }
        } catch (skillError) {
          console.error('Error updating skills:', skillError);
          // Don't fail the quest completion if skill update fails
          // Show fallback message if skill update fails
          const skillSummary = Object.entries(skillXPUpdates)
            .map(([skill, xp]) => `${skill}: +${xp} XP`)
            .join(', ');
          
          showMessage(`Daily quests completed! Earned ${totalXP} XP, ${totalCoins} coins! Skills: ${skillSummary}`, true);
        }

        // Update daily quest status
        setDailyQuestStatus(prev => ({
          ...prev,
          finishedToday: true,
          completedToday: new Set(completedQuestIds)
        }));
        
        // Don't reset completion state - keep quests marked as completed
      }
    } catch (error) {
      console.error('Error completing quests:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else {
        showMessage(error.response?.data?.message || 'Failed to complete daily quests');
      }
    } finally {
      setFinishing(false);
    }
  };

  // Navigation handlers
  const handleBackToPlayer = () => {
    navigate('/player');
  };

  // Load quests and skills on component mount
  useEffect(() => {
    fetchQuests();
    fetchSkills();
    
    // Load daily quest status from backend
    if (user) {
      fetchDailyQuestStatus();
    }
    
    // Set up midnight reset timer
    setupMidnightReset();
  }, [user]);

  // Display message with auto-clear
  const showMessage = (text, success = false) => {
    setMessage(text);
    setIsSuccess(success);
    setTimeout(() => {
      setMessage('');
      setIsSuccess(false);
    }, 4000);
  };

  // Set up automatic midnight reset
  const setupMidnightReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Set timeout for midnight reset
    const timeoutId = setTimeout(() => {
      // Refresh quest status from backend at midnight
      if (user) {
        fetchDailyQuestStatus();
        showMessage('Daily quests have been reset for the new day!', true);
      }
      
      // Set up recurring daily resets
      const intervalId = setInterval(() => {
        if (user) {
          fetchDailyQuestStatus();
          showMessage('Daily quests have been reset for the new day!', true);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(intervalId);
    }, msUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-black flex flex-col relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-900/10 via-transparent to-teal-900/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10 bg-slate-900/30 backdrop-blur-sm border-b border-emerald-500/30">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToPlayer}
            className="p-2 bg-emerald-800/60 hover:bg-emerald-700/80 rounded-lg transition-all duration-200 border border-emerald-600/50 shadow-lg hover:shadow-emerald-500/25 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center shadow-lg border border-emerald-500/50 backdrop-blur-sm">
              <svg className="w-7 h-7 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-300">
                Daily Quests
              </h1>
              <p className="text-emerald-400 text-sm font-medium">
                Player Mode - {user?.username || 'Shadow Hunter'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-bold border border-emerald-500/50 shadow-lg hover:shadow-emerald-500/50 backdrop-blur-sm"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-emerald-900/10 rounded-2xl blur-xl"></div>
            <div className="relative z-10 p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg border border-emerald-500/30">
                  <svg className="w-10 h-10 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-300 mb-4 tracking-wide">
                Complete Your Daily Quests
              </h2>
              <p className="text-emerald-300 text-lg font-medium">
                Track Your Progress and Earn Rewards
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-center font-semibold transition-all duration-300 border backdrop-blur-sm ${
              isSuccess 
                ? 'bg-emerald-900/30 text-emerald-300 border-emerald-400/50 shadow-lg shadow-emerald-500/10' 
                : 'bg-red-900/40 text-red-200 border-red-400/50 shadow-lg shadow-red-500/20'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isSuccess ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15c-.77.833.192 2.5 1.732 2.5z" />
                  )}
                </svg>
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* Progress Summary */}
          {quests.length > 0 && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-emerald-600/50 p-6 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600"></div>
              </div>

              <div className="flex items-center justify-center mb-6 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center shadow-lg border border-emerald-500/30 mr-4">
                  <svg className="w-7 h-7 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-emerald-300">
                  Progress Summary
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-600/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-300">{completedQuests.size}</div>
                    <div className="text-emerald-400 text-sm font-medium">Completed</div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-600/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-300">{quests.length - completedQuests.size}</div>
                    <div className="text-emerald-400 text-sm font-medium">Remaining</div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-600/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{calculateTotalRewards().totalXP}</div>
                    <div className="text-emerald-400 text-sm font-medium">Total XP</div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-600/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{calculateTotalRewards().totalCoins}</div>
                    <div className="text-emerald-400 text-sm font-medium">Total Coins</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-emerald-300 font-medium">Overall Progress</span>
                  <span className="text-emerald-300 font-medium">
                    {Math.round((completedQuests.size / quests.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 border border-emerald-600/30">
                  <div 
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(completedQuests.size / quests.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Quests List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-emerald-600/50 p-6 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600"></div>
            </div>

            <div className="flex items-center justify-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center shadow-lg border border-emerald-500/30 mr-4">
                <svg className="w-7 h-7 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-emerald-300">
                Today's Quests ({quests.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-emerald-300 font-medium">Loading your daily quests...</p>
              </div>
            ) : quests.length === 0 ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg border border-emerald-500/30 mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-emerald-300 text-xl font-semibold">No Daily Quests Available</p>
                <p className="text-emerald-400 font-medium">Visit Editor Mode to create your daily quests!</p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {quests.map((quest) => {
                  const isCompleted = completedQuests.has(quest._id);
                  const isFinished = dailyQuestStatus.finishedToday;
                  return (
                    <div
                      key={quest._id}
                      className={`p-5 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 relative ${
                        isFinished
                          ? 'bg-slate-900/80 border-slate-600/50 opacity-70' // Finished state
                          : isCompleted 
                            ? 'bg-emerald-900/30 border-emerald-400/50 shadow-emerald-500/20' 
                            : 'bg-slate-800/60 border-emerald-600/50 hover:border-teal-500/70'
                      }`}
                    >
                      {/* Finished overlay */}
                      {isFinished && (
                        <div className="absolute inset-0 bg-slate-900/60 rounded-lg flex items-center justify-center z-10">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-emerald-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-emerald-300 font-bold text-sm">FINISHED</p>
                            <p className="text-slate-400 text-xs">Reset at midnight</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <button
                              onClick={() => toggleQuestCompletion(quest._id)}
                              disabled={completing === quest._id || isFinished}
                              className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                                isFinished
                                  ? 'bg-slate-700 border-slate-600 cursor-not-allowed'
                                  : isCompleted
                                    ? 'bg-emerald-600 border-emerald-500'
                                    : 'border-emerald-500 hover:border-emerald-400'
                              }`}
                            >
                              {(isCompleted || isFinished) && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <h4 className={`font-bold text-lg flex items-center ${
                              isFinished
                                ? 'text-slate-400 line-through'
                                : isCompleted 
                                  ? 'text-emerald-300 line-through' 
                                  : 'text-emerald-300'
                            }`}>
                              <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {quest.name}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-6 ml-10">
                            <div className="flex items-center text-sm font-medium">
                              <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <span className={isFinished ? 'text-slate-400' : 'text-emerald-300'}>{quest.xp} XP</span>
                            </div>
                            <div className="flex items-center text-sm font-medium">
                              <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span className={isFinished ? 'text-slate-400' : 'text-emerald-300'}>{quest.coins} Coins</span>
                            </div>
                            <div className="flex items-center text-sm font-medium">
                              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span className={isFinished ? 'text-slate-400' : 'text-emerald-300'}>{quest.skill}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border ${
                          isFinished
                            ? 'bg-slate-800/50 border-slate-600/50'
                            : isCompleted 
                              ? 'bg-emerald-900/50 border-emerald-500/50' 
                              : 'bg-slate-900/50 border-emerald-600/50'
                        }`}>
                          <span className={`text-sm font-medium ${
                            isFinished
                              ? 'text-slate-400'
                              : isCompleted 
                                ? 'text-emerald-300' 
                                : 'text-emerald-400'
                          }`}>
                            {isFinished ? 'Finished' : isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Finish Button */}
          {quests.length > 0 && (
            <div className="text-center relative z-10">
              <button
                onClick={handleFinishQuests}
                disabled={finishing || completedQuests.size === 0 || dailyQuestStatus.finishedToday}
                className="px-8 py-4 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 text-white font-bold rounded-lg shadow-lg hover:from-emerald-600 hover:via-teal-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-emerald-500/50 backdrop-blur-sm text-lg"
              >
                {finishing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finishing Quests...
                  </span>
                ) : dailyQuestStatus.finishedToday ? (
                  <span className="flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Daily Quests Finished
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Finish Daily Quests ({completedQuests.size}/{quests.length})
                  </span>
                )}
              </button>
              {dailyQuestStatus.finishedToday ? (
                <p className="text-emerald-400 text-sm mt-3 font-medium">
                  Daily quests completed! Reset at midnight for tomorrow.
                </p>
              ) : completedQuests.size === 0 && quests.length > 0 ? (
                <p className="text-emerald-400 text-sm mt-3 font-medium">
                  Complete at least one quest to finish your daily routine
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyQuests;
