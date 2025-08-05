import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (token && user) {
        try {
          // Verify token is still valid
          await authService.verifyToken();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          });
        } catch (error) {
          // Token is invalid, clear storage
          authService.logout();
          dispatch({ type: 'AUTH_FAILURE', payload: null });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.login(userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
      return response;
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const signup = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.signup(userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
      return response;
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Signup failed' });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
