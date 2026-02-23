import api from '../../../services/api';

export const getTutorSessions = async (tutorId) => {
    const response = await api.get(`/sessions/tutor/${tutorId}`);
    return response.data;
};

export const getRecommendedSlot = async (tutorId) => {
    const response = await api.get(`/sessions/tutor/${tutorId}/recommend`);
    return response.data;
};

export const createSession = async (sessionData) => {
    const response = await api.post('/sessions', sessionData);
    return response.data;
};

export const updateSession = async (sessionId, sessionData) => {
    const response = await api.put(`/sessions/${sessionId}`, sessionData);
    return response.data;
};

export const deleteSession = async (sessionId) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
};
