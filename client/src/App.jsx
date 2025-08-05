import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import Home from './components/Home';
import EditorDashboard from './components/EditorDashboard';
import PlayerDashboard from './components/PlayerDashboard';
import DailyQuests from './components/DailyQuests';
import DailyQuestsEditor from './components/DailyQuestsEditor';
import DungeonQuests from './components/DungeonQuests';
import DungeonQuestsPlayer from './components/DungeonQuestsPlayer';
import Skills from './components/Skills';
import SkillsPlayer from './components/SkillsPlayer';
import PenaltyQuests from './components/PenaltyQuests';
import PenaltyQuestsPlayer from './components/PenaltyQuestsPlayer';
import Profile from './components/Profile';
import ProfilePlayer from './components/ProfilePlayer';
import ShopPlayer from './components/ShopPlayer';
import Inventory from './components/Inventory';
import InventoryPlayer from './components/InventoryPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route - login/signup */}
      <Route 
        path="/auth" 
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <AuthForm />
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/editor" 
        element={
          <ProtectedRoute>
            <EditorDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/player" 
        element={
          <ProtectedRoute>
            <PlayerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/daily-quests" 
        element={
          <ProtectedRoute>
            <DailyQuests />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/daily-quests-editor" 
        element={
          <ProtectedRoute>
            <DailyQuestsEditor />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dungeon-quests" 
        element={
          <ProtectedRoute>
            <DungeonQuests />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dungeon-quests-player" 
        element={
          <ProtectedRoute>
            <DungeonQuestsPlayer />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/skills" 
        element={
          <ProtectedRoute>
            <Skills />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/skills-player" 
        element={
          <ProtectedRoute>
            <SkillsPlayer />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/penalty-quests" 
        element={
          <ProtectedRoute>
            <PenaltyQuests />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/penalty-quests-player" 
        element={
          <ProtectedRoute>
            <PenaltyQuestsPlayer />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/shop-player" 
        element={
          <ProtectedRoute>
            <ShopPlayer />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/inventory-player" 
        element={
          <ProtectedRoute>
            <InventoryPlayer />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/rewards-inventory" 
        element={
          <ProtectedRoute>
            <InventoryPlayer />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile-player" 
        element={
          <ProtectedRoute>
            <ProfilePlayer />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/auth" replace />
        } 
      />
      
      {/* Catch all - redirect to appropriate page */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/auth" replace />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
