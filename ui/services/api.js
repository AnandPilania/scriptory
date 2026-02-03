import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6767/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Config endpoints
export const configApi = {
    get: () => api.get('/config'),
    update: (data) => api.put('/config', data),
    init: () => api.post('/init'),
}

// Documents endpoints
export const documentsApi = {
    getAll: () => api.get('/documents'),
    getOne: (id) => api.get(`/documents/${id}`),
    create: (data) => api.post('/documents', data),
    update: (id, data) => api.put(`/documents/${id}`, data),
    delete: (id) => api.delete(`/documents/${id}`),
}

// Code files endpoints
export const codeFilesApi = {
    getAll: () => api.get('/code-files'),
    getOne: (path) => api.get(`/code-files/${path}`),
}

// Health check
export const healthApi = {
    check: () => api.get('/health'),
}

export default api

// FILE: frontend/src/hooks/useDocuments.js
import { useState, useEffect } from 'react'
import { documentsApi } from '../services/api'

export function useDocuments() {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            const response = await documentsApi.getAll()
            setDocuments(response.data)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const createDocument = async (data) => {
        try {
            const response = await documentsApi.create(data)
            setDocuments([...documents, response.data])
            return response.data
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const updateDocument = async (id, data) => {
        try {
            await documentsApi.update(id, data)
            await fetchDocuments()
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const deleteDocument = async (id) => {
        try {
            await documentsApi.delete(id)
            setDocuments(documents.filter(doc => doc.id !== id))
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    return {
        documents,
        loading,
        error,
        fetchDocuments,
        createDocument,
        updateDocument,
        deleteDocument,
    }
}
