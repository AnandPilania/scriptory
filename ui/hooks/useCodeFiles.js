import { useState } from 'react'
import { codeFilesApi } from '../services/api'

export function useCodeFiles() {
    const [codeFiles, setCodeFiles] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchCodeFiles = async () => {
        try {
            setLoading(true)
            const response = await codeFilesApi.getAll()
            setCodeFiles(response.data)
        } catch (error) {
            console.error('Error fetching code files:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCodeFileContent = async (filePath) => {
        try {
            const response = await codeFilesApi.getOne(filePath)
            return response.data.content
        } catch (error) {
            console.error('Error fetching code file:', error)
            throw error
        }
    }

    return { codeFiles, loading, fetchCodeFiles, getCodeFileContent }
}
