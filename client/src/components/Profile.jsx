import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    name: '',
    xp: 0,
    coins: 0,
    titles: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingValues, setEditingValues] = useState({ xp: 0, coins: 0 });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null); // Track which title is being deleted
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Display message with auto-clear
  const showMessage = (text, success = false) => {
    setMessage(text);
    setIsSuccess(success);
    setTimeout(() => {
      setMessage('');
      setIsSuccess(false);
    }, 4000);
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!isEditing) {
      setEditingValues({ xp: profileData.xp, coins: profileData.coins });
    }
    setIsEditing(!isEditing);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setEditingValues(prev => ({ ...prev, [field]: numValue }));
  };

  // Handle saving changes
  const handleSaveChanges = async () => {
    if (editingValues.xp < 0 || editingValues.coins < 0) {
      showMessage('Values cannot be negative');
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('https://leveling-system-mern-project.onrender.com/api/user/profile', {
        totalXp: editingValues.xp,
        coins: editingValues.coins
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          xp: editingValues.xp,
          coins: editingValues.coins
        }));
        setIsEditing(false);
        showMessage('Profile updated successfully!', true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  // Handle title deletion
  const handleDeleteTitle = async (titleName) => {
    if (!window.confirm(`Are you sure you want to delete the title "${titleName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(titleName);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`https://leveling-system-mern-project.onrender.com/api/user/titles/${encodeURIComponent(titleName)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update local state to remove the deleted title
        setProfileData(prev => ({
          ...prev,
          titles: prev.titles.filter(title => {
            const currentTitleName = typeof title === 'string' ? title : title.name || title;
            return currentTitleName !== titleName;
          })
        }));
        showMessage('Title deleted successfully!', true);
      }
    } catch (error) {
      console.error('Error deleting title:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to delete title');
      }
    } finally {
      setDeleting(null);
    }
  };

  // Calculate level from XP
  const calculateLevel = (xp) => {
    return Math.floor(xp / 250);
  };

  // Get level title based on Solo Leveling shadow system
  const getLevelTitle = (level) => {
    if (level >= 100) return 'Shadow Monarch';
    if (level >= 90) return "Shadow Monarch's Right Hand";
    if (level >= 80) return 'Shadow Commander';
    if (level >= 70) return 'Elite Shadow';
    if (level >= 60) return 'Shadow Soldier';
    if (level >= 50) return 'S-Rank Hunter';
    if (level >= 40) return 'A-Rank Hunter';
    if (level >= 30) return 'B-Rank Hunter';
    if (level >= 20) return 'C-Rank Hunter';
    if (level >= 10) return 'D-Rank Hunter';
    if (level >= 1) return 'E-Rank Hunter';
    return 'Unranked';
  };

  // Get rank color based on level
  const getRankColor = (level) => {
    if (level >= 100) return 'from-black via-purple-900 to-black';
    if (level >= 90) return 'from-purple-600 via-purple-500 to-purple-600';
    if (level >= 80) return 'from-purple-600 via-blue-600 to-purple-600';
    if (level >= 70) return 'from-blue-600 via-cyan-600 to-blue-600';
    if (level >= 60) return 'from-gray-600 via-gray-500 to-gray-600';
    if (level >= 50) return 'from-yellow-600 via-yellow-500 to-yellow-600';
    if (level >= 40) return 'from-green-600 via-green-500 to-green-600';
    if (level >= 30) return 'from-blue-600 via-blue-500 to-blue-600';
    if (level >= 20) return 'from-orange-600 via-orange-500 to-orange-600';
    if (level >= 10) return 'from-red-600 via-red-500 to-red-600';
    if (level >= 1) return 'from-gray-600 via-gray-500 to-gray-600';
    return 'from-gray-700 via-gray-600 to-gray-700';
  };

  // Calculate XP needed for next level
  const getXPForNextLevel = (currentXP) => {
    const currentLevel = calculateLevel(currentXP);
    const nextLevelXP = (currentLevel + 1) * 250;
    return nextLevelXP - currentXP;
  };

  // Calculate XP progress within current level
  const getXPProgress = (currentXP) => {
    const currentLevel = calculateLevel(currentXP);
    const levelStartXP = currentLevel * 250;
    const xpInCurrentLevel = currentXP - levelStartXP;
    return (xpInCurrentLevel / 250) * 100;
  };

  // Fetch profile data from backend
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Fetch profile data from the new backend endpoint
      const response = await axios.get('https://leveling-system-mern-project.onrender.com/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setProfileData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch profile data');
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      
      // If backend fails, fallback to frontend calculation
      try {
        const token = localStorage.getItem('token');
        // Fetch data from all quest endpoints to calculate total XP
        const [dailyQuests, dungeonQuests, penaltyQuests] = await Promise.all([
          axios.get('https://leveling-system-mern-project.onrender.com/api/daily-quests', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://leveling-system-mern-project.onrender.com/api/dungeon-quests', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://leveling-system-mern-project.onrender.com/api/penalty-quests', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Calculate total XP from completed quests
        let totalXP = 0;
        let totalCoins = 0;
        const titles = new Set();

        // Daily Quests XP
        if (dailyQuests.data.success) {
          dailyQuests.data.data.forEach(quest => {
            if (quest.isCompleted) {
              totalXP += quest.xp;
              if (quest.coins) totalCoins += quest.coins;
            }
          });
          // Add title if user has completed many daily quests
          const completedDaily = dailyQuests.data.data.filter(q => q.isCompleted).length;
          if (completedDaily >= 10) titles.add('Daily Warrior');
          if (completedDaily >= 50) titles.add('Routine Master');
        }

        // Dungeon Quests XP
        if (dungeonQuests.data.success) {
          dungeonQuests.data.data.forEach(quest => {
            if (quest.isCompleted) {
              totalXP += quest.xp;
              if (quest.coins) totalCoins += quest.coins;
            }
          });
          // Add title if user has completed many dungeon quests
          const completedDungeon = dungeonQuests.data.data.filter(q => q.isCompleted).length;
          if (completedDungeon >= 5) titles.add('Dungeon Slayer');
          if (completedDungeon >= 20) titles.add('Dungeon Master');
        }

        // Add level-based titles
        const currentLevel = calculateLevel(totalXP);
        if (currentLevel >= 50) titles.add('Elite Hunter');
        if (currentLevel >= 80) titles.add('Shadow Legion');
        if (totalXP >= 10000) titles.add('XP Collector');

        setProfileData({
          name: user?.username || 'Shadow Hunter',
          xp: totalXP,
          coins: totalCoins,
          titles: Array.from(titles)
        });
      } catch (fallbackError) {
        console.error('Fallback calculation also failed:', fallbackError);
        setError('Failed to load profile data');
        // Set default data even if fallback fails
        setProfileData({
          name: user?.username || 'Shadow Hunter',
          xp: 0,
          coins: 0,
          titles: []
        });
      }
    } finally {
      // Ensure loading is always set to false
      setLoading(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    if (user || localStorage.getItem('token')) {
      fetchProfileData();
    }
    
    // Failsafe: if loading takes too long, set default data
    const timeoutId = setTimeout(() => {
      setProfileData(prevData => {
        if (prevData.name === '' && prevData.xp === 0) {
          console.warn('Profile loading timeout, setting default data');
          setLoading(false);
          return {
            name: user?.username || 'Shadow Hunter',
            xp: 0,
            coins: 0,
            titles: []
          };
        }
        return prevData;
      });
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeoutId);
  }, [user]);

  // Navigation handlers
  const handleBackToEditor = () => {
    navigate('/editor');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const currentLevel = calculateLevel(profileData.xp);
  const levelTitle = getLevelTitle(currentLevel);
  const rankColor = getRankColor(currentLevel);
  const xpProgress = getXPProgress(profileData.xp);
  const xpNeeded = getXPForNextLevel(profileData.xp);

  // Early return if user context is not ready
  if (!user && !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300 font-medium">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black flex flex-col relative overflow-hidden">
      {/* Professional Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 via-transparent to-blue-900/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-2xl"></div>
        {/* Subtle accent lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10 bg-slate-900/30 backdrop-blur-sm border-b border-purple-500/30">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToEditor}
            className="p-2 bg-purple-800/60 hover:bg-purple-700/80 rounded-lg transition-all duration-200 border border-purple-600/50 shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg border-2 border-purple-500/50 backdrop-blur-sm">
              <svg className="w-8 h-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-300">
                Hunter Profile
              </h1>
              <p className="text-purple-400 text-sm font-medium">
                Shadow Database Registry
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-bold border border-purple-500/50 shadow-lg hover:shadow-purple-500/50 backdrop-blur-sm"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Professional Page Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-purple-900/10 rounded-2xl blur-2xl"></div>
            <div className="relative z-10 p-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-purple-500/30">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-purple-400 mb-4 tracking-tight">
                Shadow Hunter Profile
              </h2>
              <p className="text-purple-300 text-xl font-medium tracking-wide mb-6 max-w-2xl mx-auto">
                Comprehensive overview of your progression through the Shadow System
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 rounded-full shadow-lg"></div>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={fetchProfileData}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 font-semibold border border-purple-500/30 shadow-xl hover:shadow-purple-500/25 backdrop-blur-sm disabled:opacity-50 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{loading ? 'Refreshing...' : 'Refresh Stats'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-center font-medium transition-all duration-300 ${
              isSuccess 
                ? 'bg-green-600 bg-opacity-20 text-green-400 border border-green-500 border-opacity-50' 
                : 'bg-red-600 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50'
            }`}>
              {message}
            </div>
          )}

          {/* Edit Controls */}
          <div className="mb-8 flex justify-center">
            <div className="flex space-x-4">
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="px-6 py-3 bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 font-semibold border border-blue-500/30 shadow-xl hover:shadow-blue-500/25 backdrop-blur-sm flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit XP & Coins</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={updating}
                    className="px-6 py-3 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 font-semibold border border-green-500/30 shadow-xl hover:shadow-green-500/25 backdrop-blur-sm flex items-center space-x-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    disabled={updating}
                    className="px-6 py-3 bg-gradient-to-r from-gray-700 to-slate-700 hover:from-gray-600 hover:to-slate-600 text-white rounded-xl transition-all duration-300 font-semibold border border-gray-500/30 shadow-xl hover:shadow-gray-500/25 backdrop-blur-sm flex items-center space-x-2 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-purple-300 font-semibold text-xl">Loading hunter data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-300 font-semibold text-xl mb-4">{error}</p>
              <button
                onClick={fetchProfileData}
                className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 font-semibold flex items-center space-x-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Profile Card */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-600/70 p-8 relative overflow-hidden">
                {/* Subtle Border Effects */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 via-blue-500 to-cyan-500"></div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-600"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-8 pb-6 border-b border-purple-600/30">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-3"></div>
                    <h3 className="text-2xl font-bold text-purple-300">
                      Hunter Identity
                    </h3>
                  </div>

                  {/* Profile Avatar */}
                  <div className="flex justify-center mb-8">
                    <div className={`w-28 h-28 bg-gradient-to-br ${rankColor} rounded-2xl flex items-center justify-center shadow-xl border-2 border-purple-500/30`}>
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Hunter Name */}
                  <div className="text-center mb-8">
                    <h4 className="text-3xl font-bold text-purple-300 mb-2">
                      {profileData.name}
                    </h4>
                    <p className="text-purple-400 font-medium text-lg">Shadow Hunter Operative</p>
                  </div>

                  {/* Level and Rank */}
                  <div className="mb-8">
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-600/30">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-white mb-1">
                            Level {currentLevel}
                          </div>
                          <div className={`inline-block px-4 py-2 bg-gradient-to-r ${rankColor} rounded-lg text-white font-semibold text-sm`}>
                            {levelTitle}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-purple-400 mb-1">Total XP</div>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editingValues.xp}
                              onChange={(e) => handleInputChange('xp', e.target.value)}
                              className="w-32 px-3 py-1 bg-slate-700 border border-cyan-500 rounded text-cyan-300 text-xl font-bold text-right focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                          ) : (
                            <div className="text-xl font-bold text-cyan-300">{profileData.xp.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                      
                      {currentLevel < 100 && (
                        <div className="mt-4 pt-4 border-t border-purple-600/20">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-purple-300">Progress to Next Level</span>
                            <span className="text-sm text-cyan-300 font-semibold">{xpNeeded} XP remaining</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-lg h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 h-full transition-all duration-1000"
                              style={{ width: `${xpProgress}%` }}
                            />
                          </div>
                          <div className="text-center mt-2">
                            <p className="text-xs text-purple-400">
                              Next Rank: <span className="text-cyan-300 font-semibold">{getLevelTitle(currentLevel + 1)}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coins */}
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Total Coins</div>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editingValues.coins}
                              onChange={(e) => handleInputChange('coins', e.target.value)}
                              className="w-32 px-3 py-1 bg-slate-700 border border-yellow-500 rounded text-yellow-300 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                          ) : (
                            <div className="text-xl font-bold text-yellow-300">{profileData.coins.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-yellow-500 font-medium">Currency</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats and Titles Card */}
              <div className="space-y-8">
                {/* Titles Card */}
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-600/70 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 via-blue-500 to-cyan-500"></div>
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-600"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-6 pb-4 border-b border-purple-600/30">
                      <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full mr-3"></div>
                      <h3 className="text-2xl font-bold text-purple-300">
                        Titles Acquired
                      </h3>
                      <div className="ml-auto text-sm text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">
                        {profileData.titles.length} earned
                      </div>
                    </div>

                    {profileData.titles.length > 0 ? (
                      <div className="space-y-3">
                        {profileData.titles.map((title, index) => {
                          // Handle both string titles and object titles
                          const titleName = typeof title === 'string' ? title : title.name || title;
                          const titleSource = typeof title === 'object' ? title.source : null;
                          const titleDate = typeof title === 'object' && title.awardedAt ? new Date(title.awardedAt).toLocaleDateString() : null;
                          
                          return (
                            <div 
                              key={index}
                              className="bg-slate-800/60 px-4 py-3 rounded-lg border border-purple-600/30 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/80 relative"
                            >
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteTitle(titleName)}
                                disabled={deleting === titleName}
                                className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 border border-red-500 shadow-md"
                                title="Delete title"
                              >
                                {deleting === titleName ? (
                                  <svg className="animate-spin w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>

                              <div className="flex items-center justify-between pr-8">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-purple-300 font-semibold">{titleName}</span>
                                    {titleSource && (
                                      <div className="text-xs text-purple-400 mt-1">
                                        Source: {titleSource.replace('_', ' ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {titleDate && (
                                  <div className="text-xs text-purple-400">
                                    {titleDate}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <p className="text-purple-300 font-semibold">No achievements earned yet</p>
                        <p className="text-purple-400 text-sm">Complete quests to unlock titles and achievements!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-600/70 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 via-blue-500 to-cyan-500"></div>
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-600"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-6 pb-4 border-b border-purple-600/30">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3"></div>
                      <h3 className="text-2xl font-bold text-purple-300">
                        Performance Metrics
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-slate-800/60 px-6 py-4 rounded-lg border border-purple-600/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <span className="text-purple-300 font-semibold">Total Experience</span>
                          </div>
                          <span className="text-cyan-300 font-bold text-xl">{profileData.xp.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/60 px-6 py-4 rounded-lg border border-purple-600/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                              </svg>
                            </div>
                            <span className="text-purple-300 font-semibold">Current Level</span>
                          </div>
                          <span className="text-cyan-300 font-bold text-xl">{currentLevel}</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/60 px-6 py-4 rounded-lg border border-purple-600/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <span className="text-purple-300 font-semibold">Earned Coins</span>
                          </div>
                          <span className="text-cyan-300 font-bold text-xl">{profileData.coins.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/60 px-6 py-4 rounded-lg border border-purple-600/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                            </div>
                            <span className="text-purple-300 font-semibold">Titles Earned</span>
                          </div>
                          <span className="text-cyan-300 font-bold text-xl">{profileData.titles.length}</span>
                        </div>
                      </div>
                      
                      {currentLevel >= 100 && (
                        <div className="bg-gradient-to-r from-purple-900/80 to-black/80 px-6 py-4 rounded-lg border border-purple-400/50">
                          <div className="text-center">
                            <div className="text-purple-300 font-bold text-lg mb-2">Max Level Achieved</div>
                            <div className="text-cyan-300 font-semibold">Shadow Monarch Status</div>
                          </div>
                        </div>
                      )}
                      
                      {xpNeeded <= 50 && currentLevel < 100 && (
                        <div className="bg-gradient-to-r from-yellow-900/60 to-orange-900/60 px-6 py-4 rounded-lg border border-yellow-400/50">
                          <div className="text-center">
                            <div className="text-yellow-300 font-bold text-lg mb-2">Level Up Imminent</div>
                            <div className="text-orange-300 font-semibold">Only {xpNeeded} XP remaining</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
