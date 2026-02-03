import { renderMarkdown } from '@/utils/markdown'

export default function MarkdownPreview({ content }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  )
}
