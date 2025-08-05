import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SkillsPlayer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    fetchSkills();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.get('https://leveling-system-mern-project.onrender.com/api/skills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if response has the expected structure
      if (response.data.success) {
        setSkills(response.data.data || []);
      } else {
        setSkills(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to load skills. Please try again.');
      
      // If unauthorized, redirect to auth
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSkillTypeIcon = (type) => {
    switch (type) {
      case 'Combat':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'Magic':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'Crafting':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'Social':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  const getSkillTypeColor = (type) => {
    switch (type) {
      case 'Combat':
        return 'text-red-400 bg-red-500/20';
      case 'Magic':
        return 'text-purple-400 bg-purple-500/20';
      case 'Crafting':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'Social':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-blue-400 bg-blue-500/20';
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-300">
                Skills Overview
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
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-blue-900/10 rounded-2xl blur-xl"></div>
            <div className="relative z-10 p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30">
                  <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-4 tracking-wide">
                Skills Realm
              </h2>
              <p className="text-blue-300 text-lg font-medium">
                Master Your Abilities Through Practice
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
          </div>

          {/* Skills List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-blue-600/50 p-6 relative overflow-hidden">
            {/* Subtle Border Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600"></div>
            </div>

            <div className="flex items-center justify-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg flex items-center justify-center shadow-lg border border-blue-500/30 mr-4">
                <svg className="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-300">
                Your Skills ({skills.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-300 font-medium">Loading your skills...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 relative z-10">
                <div className="bg-red-900/40 border border-red-400/50 rounded-lg p-6 max-w-md mx-auto shadow-lg shadow-red-500/20 backdrop-blur-sm">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-300 font-medium mb-2">Error Loading Skills</p>
                  <p className="text-red-200 text-sm mb-4">{error}</p>
                  <button
                    onClick={fetchSkills}
                    className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-bold border border-red-500/50 shadow-lg hover:shadow-red-500/50 backdrop-blur-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30 mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-blue-300 text-xl font-semibold">No Skills Found</p>
                <p className="text-blue-400 font-medium mb-4">
                  You haven't created any skills yet. Visit Editor Mode to create your first skill!
                </p>
                <button
                  onClick={() => navigate('/editor')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-bold border border-blue-500/50 shadow-lg hover:shadow-blue-500/50 backdrop-blur-sm"
                >
                  Go to Editor Mode
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 max-w-6xl mx-auto">
                {skills.map((skill) => (
                  <div
                    key={skill._id}
                    className="relative p-5 rounded-lg border transition-all duration-300 transform hover:scale-[1.02] shadow-lg backdrop-blur-sm bg-slate-800/60 border-blue-600/50 hover:border-cyan-500/70 shadow-blue-500/10"
                  >
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getSkillTypeColor(skill.type || 'default')}`}>
                      {getSkillTypeIcon(skill.type || 'default')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-300">{getDisplayName(skill.name) || 'Unnamed Skill'} - {skill.xp || 0} XP</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSkillTypeColor(skill.type || 'default')}`}>
                        {skill.type || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.floor((skill.xp || 0) / 100) || 1}
                    </div>
                    <div className="text-xs text-blue-300">Level</div>
                  </div>
                </div>

                {/* Description */}
                {skill.description && (
                  <div className="mb-4">
                    <p className="text-blue-200 text-sm leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                )}

                {/* Experience Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-300">Experience</span>
                    <span className="text-sm text-blue-400">
                      {(skill.xp || 0) % 100} / 100 XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((skill.xp || 0) % 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-400">
                      {skill.xp || 0}
                    </div>
                    <div className="text-xs text-blue-300">Total XP</div>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-400">
                      {Math.floor((skill.xp || 0) / 100) + 1}
                    </div>
                    <div className="text-xs text-blue-300">Next Level</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default SkillsPlayer;
