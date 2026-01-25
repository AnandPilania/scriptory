import { renderMarkdown } from '@/utils/markdown';

export default function MarkdownPreview({ content }) {
    return (
        <div className="mx-auto max-w-4xl">
            <div
                className="prose prose-lg dark:prose-invert prose-img:rounded-lg prose-img:shadow-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
        </div>
    );
}
