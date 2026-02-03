import { Textarea } from '@/components/ui/textarea'

export default function Editor({ value, onChange, placeholder }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[600px] font-mono text-sm resize-none"
      />
    </div>
  )
}
