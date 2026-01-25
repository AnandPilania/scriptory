import { Textarea } from '@/components/ui/textarea';

export default function Editor({ value, onChange, placeholder }) {
    return (
        <div className="mx-auto max-w-4xl">
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[600px] resize-none border-gray-200 bg-white font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900"
            />
        </div>
    );
}
