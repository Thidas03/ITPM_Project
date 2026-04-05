import api from '../../../services/api';

export const getNotifications = async () => {
    const response = await api.get(`/notifications`);
    return response.data;
};

export const markAsRead = async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await api.put(`/notifications/read-all`);
    return response.data;
};
