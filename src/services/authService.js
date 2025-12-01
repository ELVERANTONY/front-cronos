import api from '../lib/axios';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (email, code, newPassword) => {
        const response = await api.post('/auth/reset-password', { email, code, newPassword });
        return response.data;
    },

    changeTemporalPassword: async (email, temporalPassword, newPassword) => {
        const response = await api.post(`/auth/change-temporal-password?email=${email}`, {
            currentPassword: temporalPassword,  // Backend expects 'currentPassword'
            newPassword,
        });
        return response.data;
    },
};
