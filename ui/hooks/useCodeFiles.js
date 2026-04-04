import { useState } from 'react'
import { codeFilesApi } from '@/services/api'

export function useCodeFiles() {
    const [codeFiles, setCodeFiles] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchCodeFiles = async () => {
        try {
            setLoading(true)
            const response = await codeFilesApi.getAll()
            setCodeFiles(response.data)
        } catch (err) {
            console.error('Error fetching code files:', err)
        } finally {
            setLoading(false)
        }
    }

    const getCodeFileContent = async (filePath) => {
        const response = await codeFilesApi.getOne(filePath)
        return response.data.content
    }

    return { codeFiles, loading, fetchCodeFiles, getCodeFileContent }
}
