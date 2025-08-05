import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DailyQuestsEditor = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for quests
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  
  // State for skills
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  
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
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    xp: '',
    coins: '',
    skill: ''
  });
  
  // Message state
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch skills from backend
  const fetchSkills = async () => {
    try {
      const response = await axios.get('https://leveling-system-mern-project.onrender.com/api/skills', {
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
      // No fallback skills - users must create their own skills
      setSkills([]);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Display message with auto-clear
  const showMessage = (text, success = false) => {
    setMessage(text);
    setIsSuccess(success);
    setTimeout(() => {
      setMessage('');
      setIsSuccess(false);
    }, 4000);
  };

  // Fetch quests from backend
  const fetchQuests = async () => {
    try {
      const response = await axios.get('https://leveling-system-mern-project.onrender.com/api/daily-quests', {
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

  // Load quests and skills on component mount
  useEffect(() => {
    fetchQuests();
    fetchSkills();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showMessage('Please enter a quest name');
      return;
    }
    if (!formData.xp || formData.xp < 1) {
      showMessage('Please enter a valid XP value (minimum 1)');
      return;
    }
    if (!formData.coins || formData.coins < 1) {
      showMessage('Please enter a valid coins value (minimum 1)');
      return;
    }
    if (!formData.skill) {
      showMessage('Please select a skill');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post('https://leveling-system-mern-project.onrender.com/api/daily-quests', {
        name: formData.name.trim(),
        xp: parseInt(formData.xp),
        coins: parseInt(formData.coins),
        skill: formData.skill
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        showMessage('Daily quest created successfully!', true);
        // Reset form
        setFormData({
          name: '',
          xp: '',
          coins: '',
          skill: ''
        });
        // Refresh quests list
        fetchQuests();
      }
    } catch (error) {
      console.error('Error creating quest:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to create daily quest');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle quest deletion
  const handleDeleteQuest = async (questId) => {
    if (!window.confirm('Are you sure you want to delete this quest?')) {
      return;
    }

    setDeleting(questId);

    try {
      const response = await axios.delete(`https://leveling-system-mern-project.onrender.com/api/daily-quests/${questId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Remove quest from local state
        setQuests(prev => prev.filter(quest => quest._id !== questId));
        showMessage('Quest deleted successfully!', true);
      }
    } catch (error) {
      console.error('Error deleting quest:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else {
        showMessage('Failed to delete quest');
      }
    } finally {
      setDeleting(null);
    }
  };

  // Navigation handlers
  const handleBackToEditor = () => {
    navigate('/editor');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black flex flex-col relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 via-transparent to-blue-900/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/50 backdrop-blur-sm">
              <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-300">
                Daily Quests Editor
              </h1>
              <p className="text-purple-400 text-sm font-medium">
                Editor Mode - {user?.username || 'Shadow Hunter'}
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
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-purple-900/10 rounded-2xl blur-xl"></div>
            <div className="relative z-10 p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg border border-purple-500/30">
                  <svg className="w-10 h-10 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4 tracking-wide">
                Daily Quest Manager
              </h2>
              <p className="text-purple-300 text-lg font-medium">
                Create and Manage Your Daily Routine Challenges
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 rounded-full shadow-lg"></div>
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

          {/* Quest Creation Form */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-purple-600/50 p-6 mb-8 relative overflow-hidden">
            {/* Subtle Border Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>
            </div>
            
            <div className="flex items-center justify-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/30 mr-4">
                <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-purple-300">
                Create New Quest
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Quest Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Quest Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter quest name..."
                  className="w-full px-4 py-3 bg-slate-800/80 border border-purple-600/50 rounded-lg text-black placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                  disabled={submitting}
                  required
                />
              </div>

              {/* XP */}
              <div>
                <label htmlFor="xp" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  XP Reward
                </label>
                <input
                  type="number"
                  id="xp"
                  name="xp"
                  value={formData.xp}
                  onChange={handleInputChange}
                  placeholder="50"
                  min="1"
                  max="10000"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-purple-600/50 rounded-lg text-black placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Coins */}
              <div>
                <label htmlFor="coins" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Coin Reward
                </label>
                <input
                  type="number"
                  id="coins"
                  name="coins"
                  value={formData.coins}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="1"
                  max="10000"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-purple-600/50 rounded-lg text-black placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Skill */}
              <div className="md:col-span-2">
                <label htmlFor="skill" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skill Category
                </label>
                <select
                  id="skill"
                  name="skill"
                  value={formData.skill}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-purple-600/50 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                  disabled={submitting || skillsLoading}
                  required
                >
                  <option value="">
                    {skillsLoading ? 'Loading skills...' : 'Choose a skill...'}
                  </option>
                  {skills.map(skill => (
                    <option key={skill._id} value={skill.name}>
                      {getDisplayName(skill.name)}
                    </option>
                  ))}
                </select>
                {skillsLoading && (
                  <p className="text-sm text-purple-300 mt-2 font-medium">
                    Loading available skills...
                  </p>
                )}
                {!skillsLoading && skills.length === 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-purple-300 mb-3 font-medium">No skills found in the system.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/skills')}
                      className="text-sm bg-purple-700 hover:bg-purple-600 text-purple-100 px-4 py-2 rounded transition-colors duration-200 border border-purple-500 font-medium"
                    >
                      Create Skills First
                    </button>
                  </div>
                )}
                {!skillsLoading && skills.length > 0 && (
                  <p className="text-sm text-purple-300 mt-2 font-medium">
                    <span>Need to manage skills? </span>
                    <button
                      type="button"
                      onClick={() => navigate('/skills')}
                      className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                    >
                      Skill Management
                    </button>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:via-blue-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-purple-500/50 backdrop-blur-sm"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Quest...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Create Quest</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quests List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-purple-600/50 p-6 relative overflow-hidden">
            {/* Subtle Border Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>
            </div>

            <div className="flex items-center justify-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/30 mr-4">
                <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-purple-300">
                Active Quests ({quests.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-purple-300 font-medium">Loading quests...</p>
              </div>
            ) : quests.length === 0 ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg border border-purple-500/30 mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-purple-300 text-xl font-semibold">No Daily Quests Created Yet</p>
                <p className="text-purple-400 font-medium">Begin your journey by creating your first daily quest above!</p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {quests.map((quest) => (
                  <div
                    key={quest._id}
                    className="relative p-5 rounded-lg border transition-all duration-300 shadow-lg backdrop-blur-sm bg-slate-800/60 border-purple-600/50 hover:border-cyan-500/70 shadow-purple-500/10 w-full"
                  >
                    {/* Quest Controls */}
                    <div className="absolute top-3 right-3">
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteQuest(quest._id)}
                        disabled={deleting === quest._id}
                        className="w-7 h-7 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 border border-red-500 shadow-md"
                      >
                        {deleting === quest._id ? (
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
                    </div>

                    {/* Quest Details */}
                    <div className="pr-16">
                      <h4 className="font-bold text-lg mb-3 flex items-center text-purple-300">
                        <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {quest.name}
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium">
                          <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="text-purple-300">{quest.xp} XP</span>
                        </div>
                        <div className="flex items-center text-sm font-medium">
                          <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-purple-300">{quest.coins} Coins</span>
                        </div>
                        <div className="flex items-center text-sm font-medium">
                          <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="text-purple-300">{quest.skill}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-purple-600/30">
                          <div className="flex items-center justify-center space-x-2 text-xs text-purple-400 font-medium">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>Daily Quest</span>
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          </div>
                        </div>
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

export default DailyQuestsEditor;
