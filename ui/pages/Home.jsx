import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocuments } from '@/hooks/useDocuments'
import { useConfig } from '@/hooks/useConfig'

export default function Home() {
  const { documents } = useDocuments()
  const { config, initProject } = useConfig()
  const navigate = useNavigate()

  useEffect(() => {
    // If there are documents, redirect to the first one
    if (documents.length > 0) {
      navigate(`/document/${documents[0].id}`)
    }
  }, [documents, navigate])

  const handleInit = async () => {
    try {
      await initProject()
      window.location.reload()
    } catch (error) {
      console.error('Error initializing project:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
      <Folder className="w-24 h-24 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Welcome to Scriptory</h1>
      <p className="text-lg mb-6">Select a document or create a new one to get started</p>

      {!config.initialized && (
        <Button onClick={handleInit} size="lg">
          Initialize Project
        </Button>
      )}
    </div>
  )
}
