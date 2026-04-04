import { useState, useEffect } from 'react'
import { documentsApi } from '@/services/api'

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
        const response = await documentsApi.create(data)
        setDocuments(prev => [...prev, response.data])
        return response.data
    }

    const updateDocument = async (id, data) => {
        await documentsApi.update(id, data)
        await fetchDocuments()
    }

    const deleteDocument = async (id) => {
        await documentsApi.delete(id)
        setDocuments(prev => prev.filter(doc => doc.id !== id))
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    return { documents, loading, error, fetchDocuments, createDocument, updateDocument, deleteDocument }
}
