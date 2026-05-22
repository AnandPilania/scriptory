import { Menu, Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export default function Header({ toggleSidebar, onSearch }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                title="Toggle sidebar"
            >
                <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-1">
                {/* Search trigger */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSearch}
                    title="Search (⌘K)"
                    className="text-gray-500 dark:text-gray-400 gap-2 hidden sm:flex"
                >
                    <Search className="w-4 h-4" />
                    <span className="text-sm text-gray-400 hidden md:inline">Search…</span>
                    <kbd className="text-[10px] text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-1 py-0.5 hidden md:inline">⌘K</kbd>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSearch}
                    title="Search (⌘K)"
                    className="sm:hidden"
                >
                    <Search className="w-4 h-4" />
                </Button>

                {/* Dark mode toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </header>
    );
}
