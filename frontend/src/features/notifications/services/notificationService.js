import api from '../../../services/api';

export const getNotifications = async (recipientId) => {
    const response = await api.get(`/notifications/${recipientId}`);
    return response.data;
};

export const markAsRead = async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllAsRead = async (recipientId) => {
    const response = await api.put(`/notifications/${recipientId}/read-all`);
    return response.data;
};
