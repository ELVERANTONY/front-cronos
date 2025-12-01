import axios from 'axios';

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper function to decode JWT (without verification)
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error decoding JWT:', e);
        return null;
    }
}

// Request Interceptor: Inject Token
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;

        // Debug: Decode and show token contents
        const decoded = decodeJWT(token);
        console.log('🔐 Request to:', config.url);
        console.log('📋 Token payload:', decoded);
        console.log('👤 User:', decoded?.sub || decoded?.username || decoded?.email);
        console.log('🎭 Role:', decoded?.role || decoded?.authorities);
    } else {
        console.warn('⚠️ No JWT token found in localStorage');
    }
    return config;
}, (error) => {
    console.error('❌ Request config error:', error);
    return Promise.reject(error);
});

// Response Interceptor: Global Error Handling
adminApi.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error);

        if (error.response) {
            console.error('📋 Status:', error.response.status);
            console.error('📋 Error Data:', error.response.data);

            if (error.response.status === 401) {
                const token = localStorage.getItem('jwt_token');
                if (token) {
                    const decoded = decodeJWT(token);
                    console.error('🔍 Token was sent but rejected by server');
                    console.error('🔍 Token contents:', decoded);
                    console.error('🔍 Possible issue: User not found in Django database');
                }

                // Only redirect if not on login page
                if (!window.location.pathname.includes('/login')) {
                    console.warn('🚪 Redirecting to login...');
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                }
            }
        } else if (error.request) {
            console.error('📡 No response from server - Is Django running?');
        } else {
            console.error('⚙️ Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

export const adminService = {
    // ========== CHARACTERS ==========
    getCharacters: async (params = {}) => {
        const response = await adminApi.get('/characters/', { params });
        return response.data;
    },

    getCharacterDetail: async (id) => {
        const response = await adminApi.get(`/characters/${id}/`);
        return response.data;
    },

    getCharacterAdminDetail: async (id) => {
        const response = await adminApi.get(`/characters/${id}/admin_detail/`);
        return response.data;
    },

    createCharacterAsync: async (name, categoryId) => {
        const response = await adminApi.post('/characters/create_with_ai_async/', {
            name,
            category: categoryId,
        });
        return response.data;
    },

    getJobStatus: async (jobId) => {
        const response = await adminApi.get(`/characters/job_status/?job_id=${jobId}`);
        return response.data;
    },

    toggleCharacterActive: async (id) => {
        const response = await adminApi.post(`/characters/${id}/toggle_active/`);
        return response.data;
    },

    // ========== STUDENTS ==========
    getStudents: async (params = {}) => {
        const response = await adminApi.get('/students/', { params });
        return response.data;
    },

    createStudent: async (studentData) => {
        console.log('📤 Creating student:', studentData);
        const response = await adminApi.post('/students/', studentData);
        return response.data;
    },

    updateStudent: async (id, studentData) => {
        const response = await adminApi.patch(`/students/${id}/`, studentData);
        return response.data;
    },


    deleteStudent: async (id) => {
        const response = await adminApi.delete(`/students/${id}/`);
        return response.data;
    },

    toggleStudentActive: async (id) => {
        const response = await adminApi.post(`/students/${id}/toggle_active/`);
        return response.data;
    },

    // ========== CATEGORIES ==========
    getCategories: async () => {
        const response = await adminApi.get('/categories/');
        return response.data;
    },

    createCategory: async (categoryData) => {
        console.log('📤 Creating category:', categoryData);
        const response = await adminApi.post('/categories/', categoryData);
        return response.data;
    },

    updateCategory: async (id, categoryData) => {
        const response = await adminApi.put(`/categories/${id}/`, categoryData);
        return response.data;
    },

    toggleCategoryActive: async (id) => {
        const response = await adminApi.post(`/categories/${id}/toggle_active/`);
        return response.data;
    },


    deleteCategory: async (id) => {
        const response = await adminApi.delete(`/categories/${id}/`);
        return response.data;
    },

    // ========== DASHBOARD ==========
    getDashboardStats: async () => {
        const response = await adminApi.get('/dashboard/stats/');
        return response.data;
    },
};
