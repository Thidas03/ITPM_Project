// Imports
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages & Components Imports
import Dashboard from './pages/Dashboard';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Pricing from './components/Pricing';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import SessionRoom from './pages/SessionRoom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import MySessions from './pages/MySessions';
import AdminHistory from './pages/AdminHistory';
import NotificationPreferences from './pages/NotificationPreferences';
import FeedbackPage from "./pages/FeedbackPage";
import TutorReviewsPage from "./pages/TutorReviewsPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import PaymentHistory from "./pages/PaymentHistory";
import authBg from './assets/auth-bg.png';




const Home = () => {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gray-950/70" />

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <span className="px-4 py-1.5 bg-teal-500/20 text-teal-300 rounded-full text-sm font-bold mb-6 animate-bounce border border-teal-500/30">
          New Peer Sessions Available!
        </span>
        <h1 className="text-6xl md:text-7xl font-extrabold text-gray-100 mb-8 tracking-tight drop-shadow">
          Learn from Peers, <br />
          <span className="text-teal-300">Master your Future.</span>
        </h1>
        <p className="text-xl text-gray-200/80 max-w-2xl mb-12">
          The ultimate Campus Peer Tutoring platform. Connect with the best tutors in your campus, manage your sessions, and excel in every subject with STUEDU.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/login" className="px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-2xl font-bold hover:from-teal-400 hover:to-indigo-500 transition text-lg shadow-xl shadow-teal-500/20 flex items-center gap-2">
            Explore Sessions 🚀
          </Link>
          <Link to="/register" className="px-8 py-4 bg-gray-900/60 backdrop-blur-md text-gray-200 rounded-2xl font-bold hover:bg-gray-900/70 transition border border-gray-700 text-lg shadow-md">
            Join the Community
          </Link>
        </div>
      </header>

      {/* Footer */}
      <footer className="relative z-10 py-10 text-center text-slate-300/80 border-t border-gray-700/70">
        &copy; 2026 STUEDU Campus Tutors. All rights reserved.
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App font-sans antialiased text-gray-300 bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/tutor" element={
            <ProtectedRoute>
              <TutorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/session/:sessionId" element={<SessionRoom />} />
          
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/tutor-reviews" element={<TutorReviewsPage />} />
          <Route path="/my-reviews" element={<MyReviewsPage />} />
          <Route path="/admin-feedback" element={<AdminFeedbackPage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/my-sessions" element={
            <ProtectedRoute>
              <MySessions />
            </ProtectedRoute>
          } />
          <Route path="/notification-preferences" element={
            <ProtectedRoute>
              <NotificationPreferences />
            </ProtectedRoute>
          } />
          <Route path="/payment-history" element={
            <ProtectedRoute>
              <PaymentHistory />
            </ProtectedRoute>
          } />

          
          <Route path="/admin" element={
            <ProtectedRoute roles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/history" element={
            <ProtectedRoute roles={['Admin']}>
              <AdminHistory />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          theme="light"
          toastClassName="bg-gray-800 text-gray-300 border border-gray-700 shadow-xl rounded-2xl"
        />
      </div>
    </Router>
  );
}

export default App;