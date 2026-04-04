import { useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useDocuments } from '@/hooks/useDocuments'
import { useConfig } from '@/hooks/useConfig'
import { LayoutContext } from '@/components/layout/MainLayout'

export default function Home() {
    const { documents } = useDocuments()
    const { config, initProject } = useConfig()
    const { setHeaderMeta } = useContext(LayoutContext)
    const navigate = useNavigate()

    // Clear header meta on home page
    useEffect(() => {
        setHeaderMeta({ title: '', icon: '', isDirty: false })
    }, [setHeaderMeta])

    useEffect(() => {
        if (documents.length > 0) {
            navigate(`/document/${documents[0].id}`)
        }
    }, [documents, navigate])

    const handleInit = async () => {
        try {
            await initProject()
            window.location.reload()
        } catch (err) {
            console.error('Init failed:', err)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full bg-white text-center px-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Welcome to scriptory</h1>
            <p className="text-sm text-gray-400 max-w-xs mb-8">
                A local-first documentation tool. Create a page from the sidebar to get started.
            </p>

            {!config.initialized && (
                <button
                    onClick={handleInit}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
                >
                    Initialize project
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
