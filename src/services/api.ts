import axios from 'axios';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData - let the browser handle it
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorMessage = error.response?.data?.message || '';
        const status = error.response?.status;

        // Handle unauthorized access or "User/Teacher not found" scenarios (zombie token)
        if (
            status === 401 ||
            ((status === 404 || status === 400) &&
                (errorMessage.includes('Teacher with ID') ||
                    errorMessage.includes('User with ID') ||
                    errorMessage.includes('User not found')))
        ) {
            localStorage.removeItem('token');
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
