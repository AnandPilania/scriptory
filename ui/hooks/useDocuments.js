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
