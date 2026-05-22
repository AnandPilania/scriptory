import { useState, useEffect, useCallback } from 'react'
import { searchApi } from '@/services/api'

export function useSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!query.trim()) { setResults([]); return }
        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const { data } = await searchApi.query(query)
                setResults(data)
            } catch {
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 220)
        return () => clearTimeout(timer)
    }, [query])

    const clear = useCallback(() => { setQuery(''); setResults([]) }, [])

    return { query, setQuery, results, loading, clear }
}
