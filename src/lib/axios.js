import axios from 'axios';

const api = axios.create({
    baseURL: '/api',  // Uses Vite proxy to route to Spring Boot login service
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Inject Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');
            // Optional: Redirect to login if not already there
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
