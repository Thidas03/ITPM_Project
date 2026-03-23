// frontend/src/pages/AdminFeedbackPage.jsx

import React, { useEffect, useState } from "react";
import {
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} from "../services/feedbackService";

const AdminFeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // CHANGED: Load feedback data on page load
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await getAllFeedback();
      setFeedbackList(response.data || []);
    } catch (error) {
      setMessage("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // CHANGED: Status update functionality
  const handleStatusChange = async (id, status) => {
    try {
      await updateFeedbackStatus(id, status);
      setMessage("Feedback status updated successfully");
      fetchFeedback();
    } catch (error) {
      setMessage("Failed to update feedback status");
    }
  };

  // CHANGED: Delete functionality
  const handleDelete = async (id) => {
    try {
      await deleteFeedback(id);
      setMessage("Feedback deleted successfully");
      fetchFeedback();
    } catch (error) {
      setMessage("Failed to delete feedback");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-300">Admin Feedback Dashboard</h1>
            <p className="mt-2 text-gray-400">
              View all feedback, update status, and manage submitted records.
            </p>
          </div>

          <div className="rounded-full border border-teal-500/20 bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-2 font-semibold text-white shadow-lg">
            {feedbackList.length} Total
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-teal-500/20 bg-teal-500/10 px-4 py-3 text-gray-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-gray-400 shadow-xl">
            Loading feedback...
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-gray-400 shadow-xl">
            No feedback records found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {feedbackList.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-300">{item.category}</h3>
                  <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-gray-300">
                    ⭐ {item.rating}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <p>
                    <span className="text-gray-300">Session ID:</span> {item.sessionId}
                  </p>
                  <p>
                    <span className="text-gray-300">Student ID:</span> {item.studentId}
                  </p>
                  <p>
                    <span className="text-gray-300">Tutor ID:</span> {item.tutorId}
                  </p>
                  <p>
                    <span className="text-gray-300">Comment:</span> {item.comment}
                  </p>
                  <p>
                    <span className="text-gray-300">Status:</span> {item.status}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className="flex-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-gray-300 outline-none focus:border-orange-600"
                  >
                    <option value="Pending" className="bg-gray-800 text-gray-300">
                      Pending
                    </option>
                    <option value="Reviewed" className="bg-gray-800 text-gray-300">
                      Reviewed
                    </option>
                    <option value="Resolved" className="bg-gray-800 text-gray-300">
                      Resolved
                    </option>
                  </select>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow-lg transition hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-4 rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-600/10 px-3 py-2 text-xs text-gray-400">
                  Update actions are highlighted using amber/orange as requested.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;