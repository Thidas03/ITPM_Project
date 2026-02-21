import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/Dashboard';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Placeholder components
const Home = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center flex-col text-white">
    <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
      Welcome to STUEDU
    </h1>
    <p className="text-xl text-gray-400 mb-8 max-w-2xl text-center">
      The smart peer tutoring platform. Connect with peers, book sessions, and excel in your studies.
    </p>
    <a href="/dashboard" className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold py-4 px-10 rounded-full shadow-2xl transition transform hover:-translate-y-1">
      Enter Dashboard
    </a>
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
          <Route path="/dashboard" element={<Dashboard />} />
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
