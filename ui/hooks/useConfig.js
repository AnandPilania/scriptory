import { useState, useEffect } from 'react'
import { configApi } from '@/services/api'

export function useConfig() {
    const [config, setConfig] = useState({})
    const [loading, setLoading] = useState(true)

    const fetchConfig = async () => {
        try {
            setLoading(true)
            const response = await configApi.get()
            setConfig(response.data)
        } catch (error) {
            console.error('Error fetching config:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateConfig = async (data) => {
        try {
            const response = await configApi.update(data)
            setConfig(response.data)
        } catch (error) {
            console.error('Error updating config:', error)
            throw error
        }
    }

    const initProject = async () => {
        try {
            await configApi.init()
            await fetchConfig()
        } catch (error) {
            console.error('Error initializing project:', error)
            throw error
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    return { config, loading, updateConfig, initProject, fetchConfig }
}
