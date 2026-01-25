import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl transition-transform hover:scale-110"
                        title="Change theme"
                    >
                        {theme === 'light' && <Sun className="h-6 w-6" />}
                        {theme === 'dark' && <Moon className="h-6 w-6" />}
                        {theme === 'auto' && <Monitor className="h-6 w-6" />}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('auto')}>
                        <Monitor className="mr-2 h-4 w-4" />
                        Auto
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
