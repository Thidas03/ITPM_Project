import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import Dashboard from './pages/Dashboard';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';

import Home from './pages/Home';

const Login = () => <div className="text-white bg-gray-900 min-h-screen p-10">Login Page coming soon...</div>;
const Signup = () => <div className="text-white bg-gray-900 min-h-screen p-10">Sign Up Page coming soon...</div>;

function App() {
  return (
    <Router>
      <div className="App font-sans antialiased text-gray-100 bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Legacy combined dashboard (optional) */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Separate dashboards */}
          <Route path="/dashboard/tutor" element={<TutorDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          theme="dark"
          toastClassName="bg-gray-800 text-white border border-gray-700 shadow-2xl rounded-xl"
        />
      </div>
    </Router>
  );
}

export default App;
