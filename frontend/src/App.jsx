import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

import FeedbackPage from "./pages/FeedbackPage";
import TutorReviewsPage from "./pages/TutorReviewsPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";
import MyReviewsPage from "./pages/MyReviewsPage";

const Navbar = () => {
  const location = useLocation();

  const navClass = (path) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition ${
      location.pathname === path
        ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
        : "border border-teal-500/20 bg-teal-500/10 text-gray-300 hover:bg-teal-500/20"
    }`;

  return (
    <nav className="border-b border-gray-700 bg-gray-800 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-bold text-gray-300">STUEDU</h1>

        <div className="flex flex-wrap gap-3">
          <Link to="/feedback" className={navClass("/feedback")}>
            Feedback
          </Link>

          <Link to="/tutor-reviews" className={navClass("/tutor-reviews")}>
            Tutor Reviews
          </Link>

          <Link to="/my-reviews" className={navClass("/my-reviews")}>
            My Reviews
          </Link>

          <Link to="/admin-feedback" className={navClass("/admin-feedback")}>
            Admin Feedback
          </Link>
        </div>
      </div>
    </nav>
  );
};
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
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
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="text-2xl font-black text-teal-400 tracking-tighter">STUEDU</div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-400 hover:text-teal-500 font-medium">Home</Link>
          <Link to="/dashboard" className="text-gray-400 hover:text-teal-500 font-medium">Book Sessions</Link>
          <Link to="/my-sessions" className="text-gray-400 hover:text-teal-500 font-medium">My History</Link>
          {user?.role === 'Admin' && (
            <Link to="/admin" className="px-4 py-1 bg-red-50 text-red-500 rounded-lg font-bold text-sm border border-red-100 hover:bg-red-100 transition">Admin Panel</Link>
          )}
          {user ? (
            <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md hover:scale-105 transition overflow-hidden">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.firstName.charAt(0)
              )}
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-5 py-2 text-teal-400 font-bold hover:text-teal-300 transition">Login</Link>
              <Link to="/register" className="px-6 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-full font-bold hover:from-teal-400 hover:to-indigo-500 transition shadow-lg shadow-teal-500/20">Get Started</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <span className="px-4 py-1.5 bg-teal-500/20 text-teal-400 rounded-full text-sm font-bold mb-6 animate-bounce">
          New Peer Sessions Available!
        </span>
        <h1 className="text-6xl md:text-7xl font-extrabold text-gray-300 mb-8 tracking-tight">
          Learn from Peers, <br />
          <span className="text-teal-500">Master your Future.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-12">
          The ultimate Campus Peer Tutoring platform. Connect with the best tutors in your campus, manage your sessions, and excel in every subject with STUEDU.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/dashboard" className="px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-2xl font-bold hover:from-teal-400 hover:to-indigo-500 transition text-lg shadow-xl shadow-teal-500/20 flex items-center gap-2">
            Explore Sessions 🚀
          </Link>
          <Link to="/register" className="px-8 py-4 bg-gray-800 text-gray-400 rounded-2xl font-bold hover:bg-gray-900 transition border border-gray-700 text-lg shadow-md">
            Join the Community
          </Link>
        </div>
      </header>

      {/* Feature Hub */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
          <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6">📅</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">Session Management</h3>
          <p className="text-gray-400 mb-6">Browse and book tutoring slots that fit your schedule perfectly.</p>
          <Link to="/dashboard" className="text-teal-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">Go to Sessions &rarr;</Link>
        </div>
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-2xl mb-6">👤</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">User Dashboard</h3>
          <p className="text-gray-400 mb-6">Track your progress, view trust scores, and manage your account.</p>
          <Link to="/dashboard" className="text-teal-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">My Dashboard &rarr;</Link>
        </div>
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mb-6">⚙️</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">Profile & Settings</h3>
          <p className="text-gray-400 mb-6">Update your info and notification preferences in a snap.</p>
          <Link to="/profile" className="text-indigo-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">Edit Profile &rarr;</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-400 border-t border-gray-700">
        &copy; 2026 STUEDU Campus Tutors. All rights reserved.
      </footer>
    </div>
  );
};
import Dashboard from './pages/Dashboard';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';

import Home from './pages/Home';

const Login = () => <div className="text-white bg-gray-900 min-h-screen p-10">Login Page coming soon...</div>;
const Signup = () => <div className="text-white bg-gray-900 min-h-screen p-10">Sign Up Page coming soon...</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar />

        <Routes>
          <Route path="/" element={<FeedbackPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/tutor-reviews" element={<TutorReviewsPage />} />
          <Route path="/my-reviews" element={<MyReviewsPage />} />
          <Route path="/admin-feedback" element={<AdminFeedbackPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
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
            path="/my-sessions"
            element={
              <ProtectedRoute>
                <MySessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification-preferences"
            element={
              <ProtectedRoute>
                <NotificationPreferences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/history"
            element={
              <ProtectedRoute roles={['Admin']}>
                <AdminHistory />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          theme="light"
          toastClassName="bg-gray-800 text-gray-300 border border-gray-700 shadow-xl rounded-2xl"
        />
          <Route path="/signup" element={<Signup />} />
          {/* Legacy combined dashboard (optional) */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Separate dashboards */}
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;