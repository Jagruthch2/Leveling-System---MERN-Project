import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Shop = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // State for shop items
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  
  // Form state for adding new items
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: ''
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

  // Fetch shop items from backend
  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching items with token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.get('http://localhost:5000/api/shop', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Fetch items response:', response.data);
      
      if (response.data.success) {
        setItems(response.data.data);
      } else {
        showMessage('Failed to load shop items from server.');
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching shop items:', error);
      if (error.response?.status === 401) {
        showMessage('Please log in to access the shop.');
      } else {
        showMessage('Failed to load shop items. Please try again later.');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    fetchItems();
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
      showMessage('Please enter an item name');
      return;
    }
    if (!formData.description.trim()) {
      showMessage('Please enter an item description');
      return;
    }
    if (!formData.cost || formData.cost < 1) {
      showMessage('Please enter a valid cost (minimum 1 coin)');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Submitting with token:', token ? 'Token exists' : 'No token');
      console.log('Form data:', formData);
      
      const response = await axios.post('http://localhost:5000/api/shop', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        cost: parseInt(formData.cost)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Submit response:', response.data);

      if (response.data.success) {
        showMessage('Shop item added successfully!', true);
        // Reset form
        setFormData({
          name: '',
          description: '',
          cost: ''
        });
        // Refresh items list
        fetchItems();
      }
    } catch (error) {
      console.error('Error adding shop item:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        showMessage('Please log in to add items to the shop.');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to add shop item. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this shop item?')) {
      return;
    }

    setDeleting(itemId);

    try {
      const token = localStorage.getItem('token');
      console.log('Deleting shop item:', itemId);
      console.log('Auth token present:', !!token);
      
      const response = await axios.delete(`http://localhost:5000/api/shop/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Remove item from local state
        setItems(prev => prev.filter(item => item._id !== itemId));
        showMessage('Shop item deleted successfully!', true);
      }
    } catch (error) {
      console.error('Error deleting shop item:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        showMessage('Session expired. Please login again.');
        logout();
        navigate('/auth');
      } else if (error.response?.status === 403) {
        showMessage('Access denied. You can only delete items you created.');
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to delete shop item');
      }
    } finally {
      setDeleting(null);
    }
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
            onClick={onClose}
            className="p-2 bg-purple-800/60 hover:bg-purple-700/80 rounded-lg transition-all duration-200 border border-purple-600/50 shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/50 backdrop-blur-sm">
              <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-300">
                Shadow Shop
              </h1>
              <p className="text-purple-400 text-sm font-medium">
                Hunter {user?.username || 'Shadow Hunter'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/auth');
          }}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4 tracking-wide">
                Mystical Marketplace
              </h2>
              <p className="text-purple-300 text-lg font-medium">
                Trade Your Coins for Legendary Items
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

          {/* Shop Items List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-purple-600/50 p-6 mb-8 relative overflow-hidden">
            {/* Subtle Border Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>
            </div>

            <div className="flex items-center justify-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/30 mr-4">
                <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-purple-300">
                Available Items ({items.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-purple-300 font-medium">Loading shop items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg border border-purple-500/30 mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-purple-300 text-xl font-semibold">Shop is Empty</p>
                <p className="text-purple-400 font-medium">Stock the shop by adding new items!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="relative p-5 rounded-lg border transition-all duration-300 transform hover:scale-[1.02] shadow-lg backdrop-blur-sm bg-slate-800/60 border-purple-600/50 hover:border-cyan-500/70 shadow-purple-500/10"
                  >
                    {/* Delete Button */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={deleting === item._id}
                        className="w-7 h-7 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 border border-red-500 shadow-md"
                      >
                        {deleting === item._id ? (
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

                    <div className="space-y-3 pr-8">
                      <h4 className="font-bold text-lg text-purple-300 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {item.name}
                      </h4>
                      
                      <p className="text-purple-200 text-sm leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center pt-3 border-t border-purple-600/30">
                        <div className="flex items-center text-yellow-400 font-bold">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span>{item.cost} Coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Item Form */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-purple-600/50 p-6 relative overflow-hidden">
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
                Add New Item
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Item Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Item Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name..."
                  className="w-full px-4 py-3 bg-slate-800/80 border border-purple-600/50 rounded-lg text-black placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter item description..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-purple-600/50 rounded-lg text-black placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm resize-none"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Cost */}
              <div>
                <label htmlFor="cost" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Cost (Coins)
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="1"
                  max="10000"
                  className="w-full px-4 py-3 bg-slate-800/80 border border-purple-600/50 rounded-lg text-black placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 font-medium shadow-lg backdrop-blur-sm"
                  disabled={submitting}
                  required
                />
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
                      Creating Item...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Create Item</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
