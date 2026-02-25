import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/Dashboard';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f0f9ff]">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-blue-100">
        <div className="text-2xl font-black text-blue-600 tracking-tighter">STUEDU</div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-500 font-medium">Home</Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-blue-500 font-medium">Sessions</Link>
          {user ? (
            <Link to="/profile" className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-md hover:scale-105 transition">
              {user.firstName.charAt(0)}
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-5 py-2 text-blue-600 font-bold hover:text-blue-700 transition">Login</Link>
              <Link to="/register" className="px-6 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-200">Get Started</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <span className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-6 animate-bounce">
          New Peer Sessions Available!
        </span>
        <h1 className="text-6xl md:text-7xl font-extrabold text-slate-800 mb-8 tracking-tight">
          Learn from Peers, <br />
          <span className="text-blue-500">Master your Future.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mb-12">
          The ultimate Campus Peer Tutoring platform. Connect with the best tutors in your campus, manage your sessions, and excel in every subject with STUEDU.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/dashboard" className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition text-lg shadow-xl shadow-blue-200 flex items-center gap-2">
            Explore Sessions 🚀
          </Link>
          <Link to="/register" className="px-8 py-4 bg-white text-slate-600 rounded-2xl font-bold hover:bg-gray-50 transition border border-gray-200 text-lg shadow-md">
            Join the Community
          </Link>
        </div>
      </header>

      {/* Feature Hub */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-blue-50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-6">📅</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Session Management</h3>
          <p className="text-slate-500 mb-6">Browse and book tutoring slots that fit your schedule perfectly.</p>
          <Link to="/dashboard" className="text-blue-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">Go to Sessions &rarr;</Link>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-blue-50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-2xl mb-6">👤</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">User Dashboard</h3>
          <p className="text-slate-500 mb-6">Track your progress, view trust scores, and manage your account.</p>
          <Link to="/dashboard" className="text-teal-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">My Dashboard &rarr;</Link>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-blue-50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mb-6">⚙️</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Profile & Settings</h3>
          <p className="text-slate-500 mb-6">Update your info and notification preferences in a snap.</p>
          <Link to="/profile" className="text-indigo-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">Edit Profile &rarr;</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-400 border-t border-blue-100">
        &copy; 2026 STUEDU Campus Tutors. All rights reserved.
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App font-sans antialiased text-gray-100 bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          theme="light"
          toastClassName="bg-white text-slate-800 border border-blue-100 shadow-xl rounded-2xl"
        />
      </div>
    </Router>
  );
}

export default App;
