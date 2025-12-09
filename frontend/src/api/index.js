import axios from 'axios';

// Use relative path for production, localhost for development
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Category API
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Product API
export const productAPI = {
    getAll: (params = {}) => api.get('/products', { params }),
    getMyProducts: () => api.get('/products/my'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (data) => api.post('/cart', data),
    updateQuantity: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
    removeFromCart: (id) => api.delete(`/cart/${id}`),
    clearCart: () => api.delete('/cart'),
};

// Order API
export const orderAPI = {
    getOrders: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// User API (admin)
export const userAPI = {
    getAll: () => api.get('/users'),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    delete: (id) => api.delete(`/users/${id}`),
};

// Seller API (admin)
export const sellerAPI = {
    getAll: () => api.get('/sellers'),
    getPending: () => api.get('/sellers/pending'),
    approve: (id) => api.put(`/sellers/${id}/approve`),
    reject: (id) => api.put(`/sellers/${id}/reject`),
    deactivate: (id) => api.put(`/sellers/${id}/deactivate`),
};

// Upload API
export const uploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default api;
