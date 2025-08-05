import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Inventory = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/user/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setItems(response.data.data || []);
      } else {
        setItems(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setError('Failed to load inventory items. Please try again.');
      
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      setDeleting(itemId);
      setError('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        navigate('/auth');
        return;
      }

      console.log('Deleting item:', itemId);

      const response = await axios.delete(
        `http://localhost:5000/api/user/inventory/${itemId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Delete item response:', response.data);

      if (response.data.success) {
        // Remove the item from the local state
        setItems(prevItems =>
          prevItems.filter(item => item._id !== itemId)
        );
        
        // Show success message
        setSuccessMessage(response.data.message || 'Item deleted successfully!');
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(response.data.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/auth');
      } else if (error.response?.status === 404) {
        setError('Item not found. Please refresh the page.');
      } else {
        setError(error.response?.data?.message || 'Failed to delete item. Please try again.');
      }
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black flex flex-col relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 via-transparent to-violet-900/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10 bg-slate-900/30 backdrop-blur-sm border-b border-purple-500/30">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/editor')}
            className="p-2 bg-purple-800/60 hover:bg-purple-700/80 rounded-lg transition-all duration-200 border border-purple-600/50 shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-700 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/50 backdrop-blur-sm">
              <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-300">
                Inventory
              </h1>
              <p className="text-purple-400 text-sm font-medium">
                Editor {user?.username || 'Shadow Editor'}
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
            <div className="absolute inset-0 bg-purple-900/10 rounded-2xl blur-xl"></div>
            <div className="relative z-10 p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg border border-purple-500/30">
                  <svg className="w-10 h-10 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4 tracking-wide">
                Asset Management
              </h2>
              <p className="text-purple-300 text-lg font-medium">
                Manage Your Collected Items and Resources
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-purple-600 via-violet-500 to-purple-500 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Active Items List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-purple-600/50 p-6 relative overflow-hidden mb-8">
            {/* Subtle Border Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-violet-500 to-purple-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600"></div>
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-700 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/30">
                  <svg className="w-7 h-7 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-purple-300">
                  Inventory Items ({items.length}) - {items.filter(item => !item.used).length} Available, {items.filter(item => item.used).length} Used
                </h3>
              </div>
              <button
                onClick={fetchItems}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white rounded-lg transition-all duration-200 font-semibold border border-purple-500/50 shadow-lg hover:shadow-purple-500/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>

            {successMessage && (
              <div className="mb-6 relative z-10">
                <div className="bg-green-900/40 border border-green-400/50 rounded-lg p-4 max-w-lg mx-auto shadow-lg shadow-green-500/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-300 font-medium">{successMessage}</p>
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
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-purple-300 font-medium">Loading your inventory...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 relative z-10">
                <div className="bg-red-900/40 border border-red-400/50 rounded-lg p-6 max-w-md mx-auto shadow-lg shadow-red-500/20 backdrop-blur-sm">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-300 font-medium mb-2">Error Loading Inventory</p>
                  <p className="text-red-200 text-sm mb-4">{error}</p>
                  <button
                    onClick={fetchItems}
                    className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-bold border border-red-500/50 shadow-lg hover:shadow-red-500/50 backdrop-blur-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg border border-purple-500/30 mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-purple-300 text-xl font-semibold">Inventory is Empty</p>
                <p className="text-purple-400 font-medium mb-4">
                  Purchase items from the shop to fill your inventory!
                </p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={`relative p-6 rounded-lg border transition-all duration-300 shadow-lg backdrop-blur-sm ${
                      item.used 
                        ? 'bg-slate-800/40 border-gray-600/50 hover:border-gray-500/70 shadow-gray-500/10 opacity-75' 
                        : 'bg-slate-800/60 border-purple-600/50 hover:border-violet-500/70 shadow-purple-500/10'
                    }`}
                  >
                    {/* Used Badge */}
                    {item.used && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gray-600/80 text-gray-100 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 border border-gray-400/50 shadow-lg backdrop-blur-sm">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>USED</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Item Info */}
                      <div className="flex-1 space-y-3">
                        {/* Item Title */}
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full border-2 ${item.used ? 'border-gray-400 bg-slate-700/50' : 'border-purple-400 bg-slate-700/50'} flex items-center justify-center transition-all duration-300 shadow-md`}>
                            <svg className={`w-4 h-4 ${item.used ? 'text-gray-400' : 'text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 5l4 4m10-6l-4-4-4 4" />
                            </svg>
                          </div>
                          <h4 className={`font-bold text-xl flex items-center ${item.used ? 'text-gray-300 line-through' : 'text-purple-300'}`}>
                            <svg className={`w-5 h-5 mr-2 ${item.used ? 'text-gray-400' : 'text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1L5 5l4 4m10-6l-4-4-4 4" />
                            </svg>
                            {item.name || 'Unnamed Item'}
                          </h4>
                        </div>

                        {/* Item Description */}
                        {item.description && (
                          <div className={`text-sm leading-relaxed pl-11 ${item.used ? 'text-gray-200 opacity-75' : 'text-purple-200'}`}>
                            {item.description}
                          </div>
                        )}

                        {/* Item Details */}
                        <div className="flex flex-wrap items-center gap-6 text-sm pl-11">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-purple-300 font-semibold">Value: {item.cost || 0} Coins</span>
                          </div>

                          {/* Usage Status */}
                          <div className="flex items-center space-x-2">
                            {item.used ? (
                              <>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-300 font-medium">Used {item.usedAt ? new Date(item.usedAt).toLocaleDateString() : 'Recently'}</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-green-300 font-medium">Available</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-purple-300 font-medium">Can be Deleted</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <span className="text-purple-300 font-medium">Inventory Item</span>
                          </div>

                          {item.purchasedAt && (
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-purple-300 font-medium">
                                Acquired {new Date(item.purchasedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          disabled={deleting === item._id}
                          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all duration-200 font-semibold border border-red-500/50 shadow-lg hover:shadow-red-500/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {deleting === item._id ? (
                            <>
                              <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </>
                          )}
                        </button>
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

export default Inventory;
