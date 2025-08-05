import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ShopPlayer = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchItems();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.get('https://leveling-system-mern-project.onrender.com/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        // Update the user context with fresh profile data including coins
        updateUser({
          ...user,
          ...response.data.data
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    }
  };

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

      // Remove showAll=true to only get current user's items
      const response = await axios.get('https://leveling-system-mern-project.onrender.com/api/shop', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setItems(response.data.data || []);
      } else {
        setItems(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching shop items:', error);
      setError('Failed to load shop items. Please try again.');
      
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuyItem = async (itemId, itemCost, itemName) => {
    try {
      setBuying(itemId);
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }

      // Check if user has enough coins
      if (user && user.coins < itemCost) {
        setError(`Insufficient coins! You need ${itemCost} coins but only have ${user.coins}.`);
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setError('');
        }, 5000);
        return;
      }

      const response = await axios.post(
        'https://leveling-system-mern-project.onrender.com/api/user/purchase',
        { itemId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update user context with new coin balance
        if (user) {
          updateUser({
            ...user,
            coins: response.data.data.remainingCoins
          });
        }

        // Show success message
        setSuccessMessage(
          `🎉 Successfully purchased "${itemName}" for ${itemCost} coins! You have ${response.data.data.remainingCoins} coins remaining.`
        );

        // Clear success message after 8 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 8000);
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      
      let errorMessage = 'Failed to purchase item. Please try again.';
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
      setBuying(null);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-300">
                Shop
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <p className="text-blue-400 text-sm font-medium">
                  Hunter {user?.username || 'Shadow Hunter'}
                </p>
                <div className="flex items-center space-x-2 bg-yellow-600/20 px-3 py-1 rounded-full border border-yellow-500/50">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-yellow-300 font-semibold text-sm">
                    {user?.coins || 0} Coins
                  </span>
                </div>
              </div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-4 tracking-wide">
                Merchant's Bazaar
              </h2>
              <p className="text-blue-300 text-lg font-medium">
                Discover Treasures and Essential Supplies
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Available Balance Display */}
          <div className="mb-8 relative">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 backdrop-blur-xl rounded-xl shadow-xl border border-yellow-500/50 p-6 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center shadow-lg border border-yellow-500/30">
                      <svg className="w-7 h-7 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">Available Balance</h3>
                  <div className="text-3xl font-bold text-yellow-200 mb-1">
                    {user?.coins || 0}
                  </div>
                  <p className="text-yellow-400 text-sm font-medium">Coins</p>
                </div>
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

          {/* Shop Items List */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-blue-600/50 p-6 relative overflow-hidden">
            {/* Subtle Border Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600"></div>
            </div>

            <div className="flex items-center justify-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg flex items-center justify-center shadow-lg border border-blue-500/30 mr-4">
                <svg className="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-300">
                Available Items ({items.length})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-12 relative z-10">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-300 font-medium">Loading shop items...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 relative z-10">
                <div className="bg-red-900/40 border border-red-400/50 rounded-lg p-6 max-w-md mx-auto shadow-lg shadow-red-500/20 backdrop-blur-sm">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-300 font-medium mb-2">Error Loading Shop</p>
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/30 mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-blue-300 text-xl font-semibold">No Items Available</p>
                <p className="text-blue-400 font-medium mb-4">
                  The shop is currently empty. Check back later for new items!
                </p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="relative p-6 rounded-lg border transition-all duration-300 shadow-lg backdrop-blur-sm bg-slate-800/60 border-blue-600/50 hover:border-cyan-500/70 shadow-blue-500/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Item Info */}
                      <div className="flex-1 space-y-3">
                        {/* Item Title */}
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full border-2 border-blue-400 bg-slate-700/50 flex items-center justify-center transition-all duration-300 shadow-md">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-xl flex items-center text-blue-300">
                            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {item.name || 'Unnamed Item'}
                          </h4>
                        </div>

                        {/* Item Description */}
                        {item.description && (
                          <div className="text-blue-200 text-sm leading-relaxed pl-11">
                            {item.description}
                          </div>
                        )}

                        {/* Item Details */}
                        <div className="flex flex-wrap items-center gap-6 text-sm pl-11">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-blue-300 font-semibold">{item.cost || 0} Coins</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-blue-300 font-medium">In Stock</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <span className="text-blue-300 font-medium">Shop Item</span>
                          </div>
                        </div>
                      </div>

                      {/* Buy Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleBuyItem(item._id, item.cost, item.name)}
                          disabled={buying === item._id}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg transition-all duration-200 font-semibold border border-emerald-500/50 shadow-lg hover:shadow-emerald-500/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {buying === item._id ? (
                            <>
                              <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Buying...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              <span>Buy</span>
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

export default ShopPlayer;
