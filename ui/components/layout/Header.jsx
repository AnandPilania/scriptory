import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header({ toggleSidebar }) {
  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
      >
        <Menu className="w-5 h-5" />
      </Button>
    </header>
  )
}
