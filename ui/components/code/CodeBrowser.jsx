import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCodeFiles } from '@/hooks/useCodeFiles'
import CodeFileItem from './CodeFileItem'

export default function CodeBrowser({ open, onOpenChange, onInsert }) {
  const { codeFiles, loading, fetchCodeFiles, getCodeFileContent } = useCodeFiles()

  useEffect(() => {
    if (open) {
      fetchCodeFiles()
    }
  }, [open])

  const handleInsert = async (filePath) => {
    const content = await getCodeFileContent(filePath)
    onInsert(filePath, content)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Insert Code File</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : codeFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No code files found</div>
          ) : (
            <div className="divide-y">
              {codeFiles.map(file => (
                <CodeFileItem
                  key={file.path}
                  file={file}
                  onClick={() => handleInsert(file.path)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
