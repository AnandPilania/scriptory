import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
    plugins: [react()],
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    build: {
        outDir: 'public',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    editor: ['marked', 'marked-highlight', 'highlight.js'],
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './ui'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:6767',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:6767',
                changeOrigin: true,
            },
        },
    },
});
