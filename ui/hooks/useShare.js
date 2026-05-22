import { useState, useEffect, useCallback } from 'react'
import { documentsApi } from '@/services/api'

export function useShare(docId, doc) {
    const [shareInfo, setShareInfo] = useState(null) // null | { token, url }
    const [loading, setLoading] = useState(false)

    // Derive from doc config when it loads
    useEffect(() => {
        if (doc?.shareEnabled && doc?.shareToken) {
            setShareInfo({
                token: doc.shareToken,
                url: `${window.location.origin}/share/${doc.shareToken}`,
            })
        } else {
            setShareInfo(null)
        }
    }, [doc])

    const enableSharing = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await documentsApi.createShare(docId)
            setShareInfo({
                token: data.token,
                url: `${window.location.origin}/share/${data.token}`,
            })
        } finally {
            setLoading(false)
        }
    }, [docId])

    const disableSharing = useCallback(async () => {
        setLoading(true)
        try {
            await documentsApi.revokeShare(docId)
            setShareInfo(null)
        } finally {
            setLoading(false)
        }
    }, [docId])

    return { shareInfo, loading, enableSharing, disableSharing }
}
