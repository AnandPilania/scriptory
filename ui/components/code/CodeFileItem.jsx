import { Code } from 'lucide-react'

export default function CodeFileItem({ file, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
    >
      <Code className="w-4 h-4 text-gray-500" />
      <span className="text-sm font-mono">{file.path}</span>
    </button>
  )
}
