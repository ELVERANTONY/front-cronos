import api from '../lib/studentApi';

export const studentService = {
    // --- Characters ---
    getAllCharacters: async (page = 0, size = 10) => {
        const response = await api.get(`/characters?page=${page}&size=${size}`);
        return response.data;
    },

    getCharacterById: async (id) => {
        const response = await api.get(`/characters/${id}`);
        return response.data;
    },

    searchCharacters: async (name) => {
        const response = await api.get(`/characters/search?name=${name}`);
        return response.data;
    },

    getCharacterDetails: async (id) => {
        const response = await api.get(`/characters/${id}/details`);
        return response.data;
    },

    getTopCharacters: async (limit = 5) => {
        const response = await api.get(`/characters/top-interactions?limit=${limit}`);
        return response.data;
    },

    // --- Categories ---
    getAllCategories: async (page = 0, size = 10) => {
        const response = await api.get(`/categories?page=${page}&size=${size}`);
        return response.data;
    },

    getCategoryById: async (id) => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    getCategoriesWithCharacters: async () => {
        const response = await api.get('/categories/with-characters');
        return response.data;
    },

    getCharactersByCategory: async (categoryId, page = 0, size = 10) => {
        // Updated endpoint structure based on docs: /api/categories/{categoryId}/characters
        const response = await api.get(`/categories/${categoryId}/characters?page=${page}&size=${size}`);
        return response.data;
    },

    // --- Chat Sessions ---
    getMySessions: async () => {
        const response = await api.get('/chat-sessions/my-sessions');
        return response.data;
    },

    getRecentSessions: async (limit = 5) => {
        const response = await api.get(`/chat-sessions/recent?limit=${limit}`);
        return response.data;
    },

    getSessionMessages: async (sessionId) => {
        const response = await api.get(`/chat-sessions/session/${sessionId}/messages`);
        return response.data;
    },

    getCharacterMessages: async (characterId) => {
        const response = await api.get(`/chat-sessions/character/${characterId}/messages`);
        return response.data;
    },

    // --- TTS ---
    requestTTS: async (message, characterId) => {
        const response = await api.post('/tts/request', { message, characterId });
        return response.data;
    }
};
