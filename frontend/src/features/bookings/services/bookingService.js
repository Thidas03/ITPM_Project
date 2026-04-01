import api from '../../../services/api';

export const createBooking = async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
};

export const getStudentBookings = async () => {
    const response = await api.get('/bookings/my-bookings');
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
