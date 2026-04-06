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
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
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
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
      case "hidden":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
      case "flagged":
        return "border-rose-500/20 bg-rose-500/10 text-rose-400";
      default:
        return "border-slate-600 bg-slate-700 text-slate-300";
    }
  };


  return (
    <div className="min-h-screen bg-[#0f172a] font-sans antialiased text-slate-300 px-6 py-12">
      <main className="mx-auto max-w-7xl">
        {/* Dashboard Header */}
        <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span className="text-9xl font-bold">💬</span>
          </div>
          
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">
                Admin Feedback Dashboard
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-2xl">
                View all feedback, update status, and manage submitted records across the platform.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 px-6 py-2 shadow-xl shadow-teal-500/20">
                <span className="text-lg font-black text-white">
                  {feedbackList.length} Total
                </span>
              </div>
              <button
                type="button"
                onClick={loadFeedback}
                disabled={loading}
                className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-bold text-slate-300 transition-all hover:bg-slate-700 hover:border-slate-600 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Syncing..." : "Refresh Records"}
              </button>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        <div className="space-y-4 mb-8">
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 flex items-center gap-3 text-rose-400 shadow-lg animate-in fade-in slide-in-from-top-4">
              <span className="text-xl">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {actionMessage && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 flex items-center gap-3 text-emerald-400 shadow-lg animate-in fade-in slide-in-from-top-4">
              <span className="text-xl">✅</span>
              <span className="font-semibold">{actionMessage}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-teal-500"></div>
            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Synchronizing Database...</p>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="rounded-[2.5rem] border border-slate-800 border-dashed bg-slate-900/30 p-16 text-center shadow-xl">
            <div className="text-6xl mb-6 opacity-20">📂</div>
            <h3 className="text-2xl font-black text-slate-300 mb-2">No feedback records found.</h3>
            <p className="text-slate-500 font-medium">When students submit feedback, they will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {feedbackList.map((item) => (
              <div
                key={item._id}
                className="group rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-xl transition-all duration-300 hover:border-slate-600 hover:shadow-2xl hover:shadow-teal-500/5"
              >
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white leading-none mb-2">
                      {item.category || "General Feedback"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Session Context:</span>
                      <code className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-teal-400">#{item.sessionId}</code>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-sm font-bold text-amber-400 ring-1 ring-slate-700">
                      <span>⭐</span>
                      <span>{item.rating}/5</span>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status || "pending"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-tighter mb-1">Student Actor</p>
                      <p className="text-sm font-bold text-slate-300 truncate">{item.studentId}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-tighter mb-1">Tutor Target</p>
                      <p className="text-sm font-bold text-slate-300 truncate">{item.tutorId}</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-indigo-600 rounded-full opacity-30"></div>
                    <p className="pl-4 text-slate-400 italic leading-relaxed">
                      "{item.comment}"
                    </p>
                  </div>
                  
                  {item.createdAt && (
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                      Logged on {new Date(item.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest leading-none">Administrative Action</label>
                    <select
                      value={item.status || "approved"}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-300 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="approved">✅ Approve for Public View</option>
                      <option value="hidden">👁️ Hide from Tutor</option>
                      <option value="flagged">🚩 Flag for Review</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="flex h-[45px] items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 font-bold text-rose-400 transition-all hover:bg-rose-500 hover:text-white active:scale-95"
                  >
                    <span>🗑️</span>
                    <span>Purge Record</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminFeedbackPage;