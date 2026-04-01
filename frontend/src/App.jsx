import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/Dashboard';
import Pricing from './components/Pricing';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import SessionRoom from './pages/SessionRoom';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Placeholder components
const Login = () => <div className="text-gray-300 bg-gray-900 min-h-screen p-10">Login Page coming soon...</div>;

function App() {
  return (
    <Router>
      <div className="App font-sans antialiased text-gray-300 bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Pricing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/session/:sessionId" element={<SessionRoom />} />
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