import { useState, useEffect, useRef, useCallback } from 'react'

const API_PORT = 6767  // Always connect WS to the API server, not window.location.host
// (In dev, Vite runs on :3000 but WS server is on :6767)

// Persist userId so it survives page reloads within the same browser
function getOrCreateUserId() {
    let id = localStorage.getItem('scriptory:userId')
    if (!id) {
        id = 'u_' + Math.random().toString(36).slice(2, 9)
        localStorage.setItem('scriptory:userId', id)
    }
    return id
}

function getStoredName() {
    return localStorage.getItem('scriptory:userName') || ''
}

function storeName(name) {
    localStorage.setItem('scriptory:userName', name)
}

export const SESSION_USER_ID = getOrCreateUserId()

export function useUserName() {
    const [name, setNameState] = useState(getStoredName)

    const setName = useCallback((n) => {
        storeName(n)
        setNameState(n)
    }, [])

    return { name, setName, hasName: !!name.trim() }
}

export function useCollaboration(docId, userName) {
    const [collaborators, setCollaborators] = useState([])
    const [connected, setConnected] = useState(false)
    const wsRef = useRef(null)
    const reconnectTimer = useRef(null)
    const mountedRef = useRef(true)

    const displayName = userName || getStoredName() || 'Anon'

    const connect = useCallback(() => {
        if (!docId || !mountedRef.current) return

        // Always use the API server host, replacing the port
        const apiHost = window.location.hostname + ':' + API_PORT
        const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProto}//${apiHost}/ws?docId=${encodeURIComponent(docId)}&userId=${SESSION_USER_ID}&userName=${encodeURIComponent(displayName)}`

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            if (mountedRef.current) setConnected(true)
        }

        ws.onmessage = (e) => {
            if (!mountedRef.current) return
            try {
                const msg = JSON.parse(e.data)
                if (msg.type === 'presence') {
                    // Filter out ourselves
                    setCollaborators(msg.users.filter(u => u.userId !== SESSION_USER_ID))
                }
            } catch { }
        }

        ws.onclose = () => {
            if (!mountedRef.current) return
            setConnected(false)
            setCollaborators([])
            // Exponential backoff: reconnect after 3s
            reconnectTimer.current = setTimeout(connect, 3000)
        }

        ws.onerror = () => ws.close()
    }, [docId, displayName])

    useEffect(() => {
        mountedRef.current = true
        connect()
        return () => {
            mountedRef.current = false
            clearTimeout(reconnectTimer.current)
            if (wsRef.current) {
                wsRef.current.onclose = null  // prevent reconnect on unmount
                wsRef.current.close()
            }
        }
    }, [connect])

    const sendTyping = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'typing' }))
        }
    }, [])

    return { collaborators, connected, sendTyping }
}
