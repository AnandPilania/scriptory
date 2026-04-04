import { renderMarkdown } from '@/utils/markdown'

export default function MarkdownPreview({ content }) {
    const html = renderMarkdown(content)

    return (
        <div className="max-w-3xl mx-auto px-2">
            {html ? (
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            ) : (
                <div className="text-gray-300 text-sm italic mt-8">Nothing to preview yet.</div>
            )}
        </div>
    )
}
