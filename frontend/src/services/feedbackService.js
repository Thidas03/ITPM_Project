// frontend/src/services/feedbackService.js

import axios from "axios";

// CHANGED: Centralized API base URL for feedback module
const API_BASE_URL = "http://localhost:5000/api/feedback";

export const createFeedback = async (feedbackData) => {
  const response = await axios.post(API_BASE_URL, feedbackData);
  return response.data;
};

export const getAllFeedback = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

export const getFeedbackByTutor = async (tutorId) => {
  const response = await axios.get(`${API_BASE_URL}/tutor/${tutorId}`);
  return response.data;
};

export const updateFeedbackStatus = async (id, status) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, { status });
  return response.data;
};

export const deleteFeedback = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};