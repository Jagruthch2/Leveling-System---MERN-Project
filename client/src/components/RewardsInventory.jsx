import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RewardsInventory = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for rewards
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  
  // State for inventory items
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  
  // Form state for rewards
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'item',
    value: ''
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

  // Fetch rewards from backend
  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/rewards', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setRewards(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please login again.');
      } else {
        showMessage('Failed to load rewards');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory from backend
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/inventory', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setInventory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please login again.');
      } else {
        showMessage('Failed to load inventory');
      }
    } finally {
      setInventoryLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRewards();
    fetchInventory();
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
      showMessage('Please enter a reward name');
      return;
    }
    if (!formData.description.trim()) {
      showMessage('Please enter a description');
      return;
    }
    if (!formData.value || formData.value < 1) {
      showMessage('Please enter a valid value (minimum 1)');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/rewards', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        value: parseInt(formData.value)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showMessage('Reward created successfully!', true);
        // Reset form
        setFormData({
          name: '',
          description: '',
          type: 'item',
          value: ''
        });
        // Refresh rewards list
        fetchRewards();
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please login again.');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to create reward');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reward editing
  const handleEditReward = (reward) => {
    setEditing(reward._id);
    setFormData({
      name: reward.name,
      description: reward.description,
      type: reward.type,
      value: reward.value.toString()
    });
  };

  // Handle reward update
  const handleUpdateReward = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showMessage('Please enter a reward name');
      return;
    }
    if (!formData.description.trim()) {
      showMessage('Please enter a description');
      return;
    }
    if (!formData.value || formData.value < 1) {
      showMessage('Please enter a valid value (minimum 1)');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/rewards/${editing}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        value: parseInt(formData.value)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showMessage('Reward updated successfully!', true);
        // Reset form and editing state
        setFormData({
          name: '',
          description: '',
          type: 'item',
          value: ''
        });
        setEditing(null);
        // Refresh rewards list
        fetchRewards();
      }
    } catch (error) {
      console.error('Error updating reward:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please login again.');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to update reward');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      type: 'item',
      value: ''
    });
  };

  // Handle reward deletion
  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) {
      return;
    }

    setDeleting(rewardId);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/rewards/${rewardId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Remove reward from local state
        setRewards(prev => prev.filter(reward => reward._id !== rewardId));
        showMessage('Reward deleted successfully!', true);
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please login again.');
      } else {
        showMessage('Failed to delete reward');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black flex flex-col relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/10 via-transparent to-purple-900/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10 bg-slate-900/30 backdrop-blur-sm border-b border-indigo-500/30">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToEditor}
            className="p-2 bg-indigo-800/60 hover:bg-indigo-700/80 rounded-lg transition-all duration-200 border border-indigo-600/50 shadow-lg hover:shadow-indigo-500/25 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg border border-indigo-500/50 backdrop-blur-sm">
              <svg className="w-7 h-7 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 5l4 4m10-6l-4-4-4 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-indigo-300">
                Rewards & Inventory
              </h1>
              <p className="text-indigo-400 text-sm font-medium">
                Hunter {user?.username || 'Shadow Hunter'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-bold border border-indigo-500/50 shadow-lg hover:shadow-indigo-500/50 backdrop-blur-sm"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 bg-indigo-900/10 rounded-2xl blur-xl"></div>
            <div className="relative z-10 p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg border border-indigo-500/30">
                  <svg className="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 5l4 4m10-6l-4-4-4 4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-400 mb-4 tracking-wide">
                Treasure Vault
              </h2>
              <p className="text-indigo-300 text-lg font-medium">
                Manage Your Rewards and Inventory Collection
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500 rounded-full shadow-lg"></div>
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rewards Management Section */}
            <div>
              {/* Reward Creation Form */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-indigo-600/50 p-6 mb-8 relative overflow-hidden">
                {/* Subtle Border Effects */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-600"></div>
                </div>
                
                <div className="flex items-center justify-center mb-6 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg border border-indigo-500/30 mr-4">
                    <svg className="w-7 h-7 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-300">
                    {editing ? 'Edit Reward' : 'Create New Reward'}
                  </h3>
                  {editing && (
                    <button
                      onClick={handleCancelEdit}
                      className="ml-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                <form onSubmit={editing ? handleUpdateReward : handleSubmit} className="grid grid-cols-1 gap-4 relative z-10">
                  {/* Reward Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-indigo-300 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Reward Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter reward name..."
                      className="w-full px-4 py-3 bg-slate-800/80 border border-indigo-600/50 rounded-lg text-black placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-indigo-300 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter reward description..."
                      rows="3"
                      className="w-full px-4 py-3 bg-slate-800/80 border border-indigo-600/50 rounded-lg text-black placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm resize-none"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Type and Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-semibold text-indigo-300 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-800/80 border border-indigo-600/50 rounded-lg text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                        disabled={submitting}
                        required
                      >
                        <option value="item">Item</option>
                        <option value="consumable">Consumable</option>
                        <option value="equipment">Equipment</option>
                        <option value="material">Material</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="value" className="block text-sm font-semibold text-indigo-300 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Value
                      </label>
                      <input
                        type="number"
                        id="value"
                        name="value"
                        value={formData.value}
                        onChange={handleInputChange}
                        placeholder="10"
                        min="1"
                        max="10000"
                        className="w-full px-4 py-3 bg-slate-800/80 border border-indigo-600/50 rounded-lg text-black placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-6 bg-gradient-to-r from-indigo-700 via-purple-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-600 hover:via-purple-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-indigo-500/50 backdrop-blur-sm"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {editing ? 'Updating Reward...' : 'Creating Reward...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>{editing ? 'Update Reward' : 'Create Reward'}</span>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Rewards List */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-indigo-600/50 p-6 relative overflow-hidden">
                {/* Subtle Border Effects */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-600"></div>
                </div>

                <div className="flex items-center justify-center mb-6 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg border border-indigo-500/30 mr-4">
                    <svg className="w-7 h-7 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-300">
                    Available Rewards ({rewards.length})
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-12 relative z-10">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-indigo-300 font-medium">Loading rewards...</p>
                  </div>
                ) : rewards.length === 0 ? (
                  <div className="text-center py-12 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg border border-indigo-500/30 mx-auto mb-4">
                      <svg className="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 5l4 4m10-6l-4-4-4 4" />
                      </svg>
                    </div>
                    <p className="text-indigo-300 text-xl font-semibold">No Rewards Created Yet</p>
                    <p className="text-indigo-400 font-medium">Create your first reward above!</p>
                  </div>
                ) : (
                  <div className="space-y-4 relative z-10 max-h-96 overflow-y-auto">
                    {rewards.map((reward) => (
                      <div
                        key={reward._id}
                        className="p-4 rounded-lg border bg-slate-800/60 border-indigo-600/50 shadow-lg backdrop-blur-sm hover:border-cyan-500/70 transition-all duration-300 relative"
                      >
                        {/* Edit and Delete Buttons */}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <button
                            onClick={() => handleEditReward(reward)}
                            className="w-7 h-7 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-full flex items-center justify-center transition-all duration-300 border border-blue-500 shadow-md"
                            title="Edit Reward"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeleteReward(reward._id)}
                            disabled={deleting === reward._id}
                            className="w-7 h-7 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 border border-red-500 shadow-md"
                            title="Delete Reward"
                          >
                            {deleting === reward._id ? (
                              <svg className="animate-spin w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>

                        <div className="pr-16">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-lg text-indigo-300 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 5l4 4m10-6l-4-4-4 4" />
                              </svg>
                              {reward.name}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reward.type === 'item' ? 'bg-blue-900/50 text-blue-300' :
                              reward.type === 'consumable' ? 'bg-green-900/50 text-green-300' :
                              reward.type === 'equipment' ? 'bg-purple-900/50 text-purple-300' :
                              'bg-orange-900/50 text-orange-300'
                            }`}>
                              {reward.type}
                            </span>
                          </div>
                          <p className="text-indigo-400 text-sm mb-2">{reward.description}</p>
                          <div className="flex items-center text-sm font-medium">
                            <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-indigo-300">Value: {reward.value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Section */}
            <div>
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-indigo-600/50 p-6 relative overflow-hidden">
                {/* Subtle Border Effects */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-600"></div>
                </div>

                <div className="flex items-center justify-center mb-6 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg border border-indigo-500/30 mr-4">
                    <svg className="w-7 h-7 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-300">
                    Inventory ({inventory.length})
                  </h3>
                </div>

                {inventoryLoading ? (
                  <div className="text-center py-12 relative z-10">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-indigo-300 font-medium">Loading inventory...</p>
                  </div>
                ) : inventory.length === 0 ? (
                  <div className="text-center py-12 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg border border-indigo-500/30 mx-auto mb-4">
                      <svg className="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-indigo-300 text-xl font-semibold">Inventory is Empty</p>
                    <p className="text-indigo-400 font-medium">Complete quests to earn rewards!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 max-h-96 overflow-y-auto">
                    {inventory.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="p-4 rounded-lg border bg-slate-800/60 border-indigo-600/50 shadow-lg backdrop-blur-sm transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-indigo-300 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 5l4 4m10-6l-4-4-4 4" />
                            </svg>
                            {item.name}
                          </h4>
                          <span className="text-indigo-300 text-sm font-medium">
                            x{item.quantity || 1}
                          </span>
                        </div>
                        <p className="text-indigo-400 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsInventory;
