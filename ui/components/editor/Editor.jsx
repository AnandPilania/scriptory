import { useRef, useEffect } from 'react'

export default function Editor({ value, onChange, placeholder }) {
    const ref = useRef(null)

    // Auto-grow the textarea as the user types
    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }, [value])

    return (
        <div className="max-w-3xl mx-auto px-2">
            <textarea
                ref={ref}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="editor-textarea"
                style={{ minHeight: '70vh' }}
                spellCheck={false}
            />
        </div>
    )
}
