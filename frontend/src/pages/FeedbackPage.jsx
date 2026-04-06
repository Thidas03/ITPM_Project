// frontend/src/pages/FeedbackPage.jsx

import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { createFeedback } from "../services/feedbackService";

const FeedbackPage = () => {
  const location = useLocation();
  const initialData = location.state || {};

  const [formData, setFormData] = useState({
    sessionId: initialData.sessionId || "",
    studentId: initialData.studentId || "",
    tutorId: initialData.tutorId || "",
    rating: "",
    comment: "",
    category: "General",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sessionId.trim()) newErrors.sessionId = "Session ID is required";
    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    if (!formData.tutorId.trim()) newErrors.tutorId = "Tutor ID is required";

    if (!formData.rating) {
      newErrors.rating = "Rating is required";
    } else if (Number(formData.rating) < 1 || Number(formData.rating) > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }

    if (!formData.comment.trim()) {
      newErrors.comment = "Comment is required";
    } else if (formData.comment.trim().length < 5) {
      newErrors.comment = "Comment must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFillDemoData = () => {
    setFormData((prev) => ({
      sessionId: prev.sessionId || "SES-101",
      studentId: prev.studentId || "STU-2023001",
      tutorId: prev.tutorId || "TUT-450",
      rating: "5",
      comment: "The tutor explained the lesson very clearly and was very helpful.",
      category: "Teaching Quality",
    }));
    setErrors({});
    setSuccessMessage("");
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setServerError("");

    if (!validateForm()) return;

    try {
      await createFeedback({
        ...formData,
        rating: Number(formData.rating),
      });

      setSuccessMessage("Feedback submitted successfully!");

      setFormData({
        sessionId: "",
        studentId: "",
        tutorId: "",
        rating: "",
        comment: "",
        category: "General",
      });

      setErrors({});
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-300">Submit Feedback</h1>
          <p className="mt-2 text-gray-400">
            Rate your tutoring session and share your learning experience.
          </p>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleFillDemoData}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg transition hover:scale-[1.02]"
          >
            Fill Demo Data
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-gray-300">
            {successMessage}
          </div>
        )}

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Session ID</label>
            <input
              type="text"
              name="sessionId"
              value={formData.sessionId}
              onChange={handleChange}
              placeholder="Enter session ID"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 placeholder-gray-500 outline-none focus:border-teal-500"
            />
            {errors.sessionId && <p className="mt-1 text-sm text-red-400">{errors.sessionId}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Enter student ID"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 placeholder-gray-500 outline-none focus:border-teal-500"
            />
            {errors.studentId && <p className="mt-1 text-sm text-red-400">{errors.studentId}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Tutor ID</label>
            <input
              type="text"
              name="tutorId"
              value={formData.tutorId}
              onChange={handleChange}
              placeholder="Enter tutor ID"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 placeholder-gray-500 outline-none focus:border-teal-500"
            />
            {errors.tutorId && <p className="mt-1 text-sm text-red-400">{errors.tutorId}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Rating (1 to 5)</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="Enter rating"
              min="1"
              max="5"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 placeholder-gray-500 outline-none focus:border-teal-500"
            />
            {errors.rating && <p className="mt-1 text-sm text-red-400">{errors.rating}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 outline-none focus:border-teal-500"
            >
              <option value="General">General</option>
              <option value="Teaching Quality">Teaching Quality</option>
              <option value="Communication">Communication</option>
              <option value="Punctuality">Punctuality</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Comment</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Write your feedback"
              rows="5"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 placeholder-gray-500 outline-none focus:border-teal-500"
            />
            {errors.comment && <p className="mt-1 text-sm text-red-400">{errors.comment}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01]"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;