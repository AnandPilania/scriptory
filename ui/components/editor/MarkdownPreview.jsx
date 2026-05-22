import { renderMarkdown } from '@/utils/markdown';
import 'highlight.js/styles/github.css';

export default function MarkdownPreview({ content }) {
    return (
        <div className="max-w-4xl mx-auto">
            <div
                className={[
                    'prose prose-gray dark:prose-invert max-w-none',
                    'prose-headings:font-semibold',
                    'prose-code:before:content-none prose-code:after:content-none',
                    'prose-pre:p-0 prose-pre:bg-transparent',
                ].join(' ')}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
        </div>
    );
}
