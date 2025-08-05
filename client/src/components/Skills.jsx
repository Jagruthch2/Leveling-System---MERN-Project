import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Skills = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for skills
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    xp: 0
  });
  
  // Message state
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

  // Fetch skills from backend
  const fetchSkills = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/skills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        // Server should already filter by user, but add client-side verification as backup
        const userSkills = response.data.data.filter(skill => {
          if (skill.createdBy && skill.createdBy._id) {
            const matches = skill.createdBy._id === user?.id;
            return matches;
          }
          // If no createdBy._id field, trust server filtering
          return true;
        });
        
        setSkills(userSkills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else {
        showMessage('Failed to load skills');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load skills on component mount
  useEffect(() => {
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

  // Check if skill name already exists for current user
  const checkDuplicateSkillName = (displayName) => {
    if (!displayName || !displayName.trim()) return false;
    if (!user?.id) return false; // Can't check without user ID
    
    const fullSkillName = getFullSkillName(displayName);
    
    // Only check against skills that belong to the current user
    const userSkills = skills.filter(skill => {
      const skillUserId = skill.createdBy?._id || skill.createdBy;
      return skillUserId === user.id;
    });
    
    const isDuplicate = userSkills.some(skill => 
      skill.name && skill.name === fullSkillName
    );
    
    return isDuplicate;
  };

  const isDuplicateSkillName = formData.name.trim() ? checkDuplicateSkillName(formData.name) : false;

  // Check if user owns a skill
  const isSkillOwnedByUser = (skill) => {
    const skillUserId = skill.createdBy?._id || skill.createdBy;
    return skillUserId === user?.id;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showMessage('Please enter a skill name');
      return;
    }

    // Ensure we have user information
    if (!user?.id) {
      showMessage('User authentication error. Please log in again.');
      logout();
      navigate('/auth');
      return;
    }

    // Skip client-side duplicate check and let server handle it
    // This ensures we don't have false positives from client-side logic

    // Create the full skill name with user ID suffix
    const fullSkillName = getFullSkillName(formData.name.trim());

    setSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/skills', {
        name: fullSkillName,
        xp: parseInt(formData.xp) || 0
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        showMessage('Skill created successfully!', true);
        // Reset form
        setFormData({
          name: '',
          xp: 0
        });
        // Refresh skills list
        fetchSkills();
      }
    } catch (error) {
      console.error('Error creating skill:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to create skill');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle XP update
  const handleUpdateXP = async (skillId, newXP) => {
    // Validate XP value
    const parsedXP = parseInt(newXP);
    if (isNaN(parsedXP) || parsedXP < 0) {
      showMessage('Please enter a valid XP value (0 or greater)');
      return;
    }
    
    setUpdating(skillId);

    try {
      const response = await axios.put(`http://localhost:5000/api/skills/${skillId}`, {
        xp: parsedXP
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        // Update local state
        setSkills(prev => prev.map(skill => 
          skill._id === skillId 
            ? { ...skill, xp: parsedXP, level: Math.floor(parsedXP / 100) }
            : skill
        ));
        showMessage('Skill XP updated successfully!', true);
        console.log('✅ Local state updated successfully');
      } else {
        console.error('❌ Server response indicates failure:', response.data);
        showMessage(response.data.message || 'Failed to update skill XP');
      }
    } catch (error) {
      console.error('❌ Error updating skill:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.status === 404) {
        showMessage('Skill not found. Please refresh the page.');
      } else if (error.response?.status === 403) {
        showMessage('Access denied. You can only update your own skills.');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage(`Failed to update skill XP: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setUpdating(null);
    }
  };

  // Handle skill deletion
  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      return;
    }

    // Find the skill to verify ownership before attempting deletion
    const skillToDelete = skills.find(skill => skill._id === skillId);
    if (!skillToDelete) {
      showMessage('Skill not found.');
      return;
    }

    // Verify user owns this skill
    const skillUserId = skillToDelete.createdBy?._id || skillToDelete.createdBy;
    
    if (skillUserId !== user?.id) {
      showMessage('Access denied. You can only delete your own skills.');
      return;
    }

    setDeleting(skillId);

    try {
      const response = await axios.delete(`http://localhost:5000/api/skills/${skillId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Remove skill from local state
        setSkills(prev => prev.filter(skill => skill._id !== skillId));
        showMessage('Skill deleted successfully!', true);
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.status === 403) {
        showMessage('Access denied. You can only delete your own skills.');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to delete skill');
      }
    } finally {
      setDeleting(null);
    }
  };

  // Calculate level from XP
  const calculateLevel = (xp) => {
    return Math.floor(xp / 100);
  };

  // Get level progress percentage
  const getLevelProgress = (xp) => {
    const currentLevelXP = xp % 100;
    return (currentLevelXP / 100) * 100;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToEditor}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Skills</h1>
              <p className="text-gray-400 text-xs sm:text-sm">Welcome, {user?.username || 'Shadow Hunter'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400 mb-2 sm:mb-4">
              Skills Manager
            </h2>
            <p className="text-gray-300 text-base sm:text-lg">
              Track and develop your abilities
            </p>
            <div className="mt-2 sm:mt-4 flex justify-center">
              <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-center font-medium transition-all duration-300 text-sm sm:text-base ${
              isSuccess 
                ? 'bg-green-600 bg-opacity-20 text-green-400 border border-green-500 border-opacity-50' 
                : 'bg-red-600 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50'
            }`}>
              {message}
            </div>
          )}

          {/* Add Skill Form */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 border-opacity-50 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Skill
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Skill Name */}
              <div className="lg:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter skill name (e.g., Programming, Design)"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 bg-opacity-90 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                    isDuplicateSkillName 
                      ? 'border-red-500 border-opacity-70 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-600 border-opacity-50 focus:ring-yellow-500 focus:border-yellow-500'
                  }`}
                  disabled={submitting}
                  required
                />
                {isDuplicateSkillName && formData.name.trim() && (
                  <p className="mt-2 text-xs sm:text-sm text-red-400 flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    You already have a skill with this name
                  </p>
                )}
              </div>

              {/* Initial XP */}
              <div>
                <label htmlFor="xp" className="block text-sm font-medium text-gray-300 mb-2">
                  Initial XP
                </label>
                <input
                  type="number"
                  id="xp"
                  name="xp"
                  value={formData.xp}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  max="100000"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 bg-opacity-90 border border-gray-600 border-opacity-50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-sm sm:text-base"
                  disabled={submitting}
                />
              </div>

              {/* Submit Button */}
              <div className="lg:col-span-3">
                <button
                  type="submit"
                  disabled={submitting || isDuplicateSkillName}
                  className={`w-full py-2 sm:py-3 px-4 font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transform transition-all duration-300 text-sm sm:text-base ${
                    submitting || isDuplicateSkillName
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-700 hover:to-orange-700 hover:scale-105'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Skill...
                    </span>
                  ) : isDuplicateSkillName ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Skill Name Already Exists
                    </span>
                  ) : (
                    'Create Skill'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Skills List */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 border-opacity-50 p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Your Skills ({skills.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm sm:text-base">Loading skills...</p>
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-gray-400 text-base sm:text-lg">No skills yet</p>
                <p className="text-gray-500 text-sm sm:text-base">Create your first skill above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {skills.map((skill) => (
                  <div
                    key={skill._id}
                    className="relative p-4 sm:p-6 rounded-lg border border-gray-600 border-opacity-50 bg-gray-700 bg-opacity-50 hover:border-yellow-500 hover:border-opacity-70 transition-all duration-300 transform hover:scale-105"
                  >
                    {/* Delete Button - Only show for skills owned by current user */}
                    {isSkillOwnedByUser(skill) && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <button
                          onClick={() => handleDeleteSkill(skill._id)}
                          disabled={deleting === skill._id}
                          className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 border border-red-500 shadow-md"
                        >
                          {deleting === skill._id ? (
                            <svg className="animate-spin w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Skill Header */}
                    <div className="mb-3 sm:mb-4 pr-6 sm:pr-8">
                      <h4 className="font-bold text-lg sm:text-xl text-white mb-1 sm:mb-2 truncate">
                        {getDisplayName(skill.name)}
                      </h4>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-yellow-400 font-semibold">
                          Level {calculateLevel(skill.xp)}
                        </span>
                        <span className="text-gray-300">
                          {skill.xp} XP
                        </span>
                      </div>
                    </div>

                    {/* Level Progress Bar */}
                    <div className="mb-3 sm:mb-4">
                      <div className="w-full bg-gray-600 rounded-full h-2 sm:h-3">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                          style={{ width: `${getLevelProgress(skill.xp)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{skill.xp % 100} / 100 XP</span>
                        <span className="hidden sm:inline">Next: Level {calculateLevel(skill.xp) + 1}</span>
                        <span className="sm:hidden">Lv.{calculateLevel(skill.xp) + 1}</span>
                      </div>
                    </div>

                    {/* XP Update */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        defaultValue={skill.xp}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 border border-gray-600 rounded text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateXP(skill._id, e.target.value);
                          }
                        }}
                        disabled={updating === skill._id}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.parentNode.querySelector('input');
                          handleUpdateXP(skill._id, input.value);
                        }}
                        disabled={updating === skill._id}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs sm:text-sm transition-colors duration-200 disabled:opacity-50"
                      >
                        {updating === skill._id ? (
                          <svg className="animate-spin w-3 h-3 sm:w-4 sm:h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <span className="hidden sm:inline">Update</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default Skills;
