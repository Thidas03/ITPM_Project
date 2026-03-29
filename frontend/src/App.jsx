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
        </Routes>
      </div>
    </Router>
  );
}

export default App;