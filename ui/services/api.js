import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6767/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const configApi = {
    get: () => api.get('/config'),
    update: (data) => api.put('/config', data),
    init: () => api.post('/init'),
}

export const documentsApi = {
    getAll: () => api.get('/documents'),
    getOne: (id) => api.get(`/documents/${id}`),
    create: (data) => api.post('/documents', data),
    update: (id, data) => api.put(`/documents/${id}`, data),
    delete: (id) => api.delete(`/documents/${id}`),
    toggleFavorite: (id) => api.post(`/documents/${id}/toggle-favorite`),
}

export const codeFilesApi = {
    getAll: () => api.get('/code-files'),
    getOne: (path) => api.get(`/code-files/${path}`),
}

export const commentsApi = {
    addComment: (id, data) => api.post(`/documents/${id}/comments`, data),
}

export const healthApi = {
    check: () => api.get('/health'),
}

export default api
