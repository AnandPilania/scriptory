import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setThemeState] = useState(() => {
        // Read from localStorage first, then system
        const saved = localStorage.getItem('scriptory-theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('scriptory-theme', theme);
    }, [theme]);

    const toggleTheme = () =>
        setThemeState(t => (t === 'dark' ? 'light' : 'dark'));

    const setTheme = (t) => setThemeState(t);

    return { theme, toggleTheme, setTheme, isDark: theme === 'dark' };
}
