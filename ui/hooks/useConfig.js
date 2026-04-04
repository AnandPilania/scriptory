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
        } catch (err) {
            console.error('Error fetching config:', err)
        } finally {
            setLoading(false)
        }
    }

    const updateConfig = async (data) => {
        const response = await configApi.update(data)
        setConfig(response.data)
    }

    const initProject = async () => {
        await configApi.init()
        await fetchConfig()
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    return { config, loading, updateConfig, initProject, fetchConfig }
}
