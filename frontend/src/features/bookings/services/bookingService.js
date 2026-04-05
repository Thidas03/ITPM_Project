import api from '../../../services/api';

export const createBooking = async (bookingData) => {
    // bookingData should contain: student, availability, bookingDate
    const response = await api.post('/bookings', bookingData);
    return response.data;
};

export const createSessionBooking = async (bookingData) => {
    // bookingData should contain: student, session
    const response = await api.post('/bookings/session', bookingData);
    return response.data;
};

export const getStudentBookings = async (studentId) => {
    const response = await api.get(`/bookings/student/${studentId}`);
    return response.data;
};

export const getTutorBookings = async (tutorId) => {
    const response = await api.get(`/bookings/tutor/${tutorId}`);
    return response.data;
};

export const cancelBooking = async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
};

export const completeBooking = async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/complete`);
    return response.data;
};

export const rateBooking = async (bookingId, ratingData) => {
    const response = await api.put(`/bookings/${bookingId}/rate`, ratingData);
    return response.data;
};
