// frontend/src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import FeedbackPage from "./pages/FeedbackPage";
import TutorReviewsPage from "./pages/TutorReviewsPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";

function App() {
  return (
    <Router>
      {/* CHANGED: Tailwind dark themed navbar with required color scheme */}
      <div className="min-h-screen bg-gray-900">
        <nav className="border-b border-gray-700 bg-gray-800 shadow-lg">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-bold text-gray-300">STUEDU</h1>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/feedback"
                className="rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:scale-[1.02]"
              >
                Feedback
              </Link>
              <Link
                to="/tutor-reviews"
                className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-teal-500/20"
              >
                Tutor Reviews
              </Link>
              <Link
                to="/admin-feedback"
                className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-indigo-500/20"
              >
                Admin Feedback
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<FeedbackPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/tutor-reviews" element={<TutorReviewsPage />} />
          <Route path="/admin-feedback" element={<AdminFeedbackPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;