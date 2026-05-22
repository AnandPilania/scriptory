import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchModal from '../search/SearchModal';
import { useTheme } from '@/hooks/useTheme';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const { isDark } = useTheme();
    const navigate = useNavigate();

    // ⌘K global shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            // ⌘N new document — let sidebar handle this
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className={`flex h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
            <div className="flex h-full w-full bg-gray-50 dark:bg-gray-950">
                <Sidebar isOpen={sidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <Header
                        toggleSidebar={() => setSidebarOpen(o => !o)}
                        onSearch={() => setSearchOpen(true)}
                    />
                    <main className="flex-1 overflow-hidden">
                        <Outlet />
                    </main>
                </div>
            </div>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
