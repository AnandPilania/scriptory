import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Config ──────────────────────────────────────────────────────────────────
export const configApi = {
    get: () => api.get('/config'),
    update: (data) => api.put('/config', data),
    init: () => api.post('/init'),
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentsApi = {
    getAll: () => api.get('/documents'),
    getOne: (id) => api.get(`/documents/${id}`),
    create: (data) => api.post('/documents', data),
    update: (id, data) => api.put(`/documents/${id}`, data),
    delete: (id) => api.delete(`/documents/${id}`),
};

// ─── Versions ────────────────────────────────────────────────────────────────
export const versionsApi = {
    list: (id) => api.get(`/documents/${id}/versions`),
    get: (id, ts) => api.get(`/documents/${id}/versions/${ts}`),
    restore: (id, ts) => api.post(`/documents/${id}/versions/${ts}/restore`),
};

// ─── Comments ────────────────────────────────────────────────────────────────
export const commentsApi = {
    list: (id) => api.get(`/documents/${id}/comments`),
    create: (id, data) => api.post(`/documents/${id}/comments`, data),
    reply: (id, cid, data) => api.post(`/documents/${id}/comments/${cid}/replies`, data),
    delete: (id, cid) => api.delete(`/documents/${id}/comments/${cid}`),
};

// ─── Search ──────────────────────────────────────────────────────────────────
export const searchApi = {
    query: (q) => api.get('/search', { params: { q } }),
};

// ─── Templates ───────────────────────────────────────────────────────────────
export const templatesApi = {
    list: () => api.get('/templates'),
    get: (id) => api.get(`/templates/${id}`),
};

// ─── Code Files ──────────────────────────────────────────────────────────────
export const codeFilesApi = {
    getAll: () => api.get('/code-files'),
    getOne: (filePath) => api.get(`/code-files/${filePath}`),
};

// ─── File upload ─────────────────────────────────────────────────────────────
export const uploadApi = {
    upload: (file) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
};

// ─── Health ──────────────────────────────────────────────────────────────────
export const healthApi = {
    check: () => api.get('/health'),
};

export default api;
