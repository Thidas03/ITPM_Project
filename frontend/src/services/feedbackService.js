// frontend/src/services/feedbackService.js

import api from "./api";

// Create feedback
export const createFeedback = async (feedbackData) => {
  const response = await api.post("/feedback", feedbackData);
  return response.data;
};

// Get all feedback for admin
export const getAllFeedback = async () => {
  const response = await api.get("/feedback");
  return response.data;
};

// Get anonymous feedback by tutor ID
export const getFeedbackByTutor = async (tutorId) => {
  const response = await api.get(`/feedback/tutor/${tutorId}`);
  return response.data;
};

// Update feedback status
export const updateFeedbackStatus = async (id, status) => {
  const response = await api.put(`/feedback/${id}`, { status });
  return response.data;
};

// Delete feedback
export const deleteFeedback = async (id) => {
  const response = await api.delete(`/feedback/${id}`);
  return response.data;
};