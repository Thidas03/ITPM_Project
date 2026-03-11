import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import Dashboard from './pages/Dashboard';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Placeholder components
const Home = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center flex-col text-white">
    <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
      Welcome to STUEDU
    </h1>
    <p className="text-xl text-gray-400 mb-8 max-w-2xl text-center">
      The smart peer tutoring platform. Connect with peers, book sessions, and excel in your studies.
    </p>
    <div className="flex gap-4">
      <a
        href="/dashboard/tutor"
        className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-2xl transition transform hover:-translate-y-1"
      >
        Tutor Dashboard
      </a>
      <a
        href="/dashboard/student"
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-2xl transition transform hover:-translate-y-1"
      >
        Student Dashboard
      </a>
    </div>
  </div>
);

const Login = () => <div className="text-white bg-gray-900 min-h-screen p-10">Login Page coming soon...</div>;

function App() {
  return (
    <Router>
      <div className="App font-sans antialiased text-gray-100 bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
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
