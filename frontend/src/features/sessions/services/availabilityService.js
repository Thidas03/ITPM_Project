import api from '../../../services/api';

// Create new availability slot
export const createAvailability = async (availabilityData) => {
    try {
        const response = await api.post('/availability', availabilityData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update existing availability slot
export const updateAvailability = async (id, availabilityData) => {
    try {
        const response = await api.put(`/availability/${id}`, availabilityData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get all availability for a specific tutor
export const getTutorAvailability = async (tutorId) => {
    try {
        const response = await api.get(`/availability/tutor/${tutorId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete availability
export const deleteAvailability = async (id) => {
    try {
        const response = await api.delete(`/availability/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cancel availability (soft delete/mark booked)
export const cancelAvailability = async (id) => {
    try {
        const response = await api.put(`/availability/cancel/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
