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
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllFeedback();
      setFeedbackList(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feedback");
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setError("");
      setActionMessage("");

      await updateFeedbackStatus(id, newStatus);

      setActionMessage(`Feedback status updated to "${newStatus}" successfully.`);

      setFeedbackList((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update feedback status");
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      setActionMessage("");

      await deleteFeedback(id);

      setActionMessage("Feedback deleted successfully.");

      setFeedbackList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete feedback");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "border border-teal-500/20 bg-teal-500/10 text-teal-300";
      case "hidden":
        return "border border-amber-500/20 bg-amber-500/10 text-amber-300";
      case "flagged":
        return "border border-red-500/20 bg-red-500/10 text-red-300";
      default:
        return "border border-gray-600 bg-gray-700 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-300">Admin Feedback</h1>
              <p className="mt-2 text-gray-400">
                View, update, and manage all submitted feedback in the system.
              </p>
            </div>

            <button
              type="button"
              onClick={loadFeedback}
              className="rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-3 font-medium text-white shadow-lg transition hover:scale-[1.02]"
            >
              Refresh Feedback
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {actionMessage && (
            <div className="mt-4 rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-gray-300">
              {actionMessage}
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-8 text-center text-gray-300 shadow-xl">
            Loading feedback...
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-400 shadow-xl">
            No feedback found.
          </div>
        ) : (
          <div className="grid gap-5">
            {feedbackList.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-xl"
              >
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-300">
                      {item.category || "General"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Session ID: {item.sessionId}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-sm font-semibold text-gray-300">
                      ⭐ {item.rating}/5
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status || "no status"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-gray-400">
                  <p>
                    <span className="text-gray-300">Student ID:</span> {item.studentId}
                  </p>
                  <p>
                    <span className="text-gray-300">Tutor ID:</span> {item.tutorId}
                  </p>
                  <p>
                    <span className="text-gray-300">Comment:</span> {item.comment}
                  </p>
                  {item.createdAt && (
                    <p>
                      <span className="text-gray-300">Submitted:</span>{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
                  <select
                    value={item.status || "approved"}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 outline-none focus:border-amber-500"
                  >
                    <option value="approved">Approved</option>
                    <option value="hidden">Hidden</option>
                    <option value="flagged">Flagged</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg bg-red-500 px-5 py-3 font-medium text-white shadow-lg transition hover:scale-[1.02]"
                  >
                    Delete
                  </button>
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