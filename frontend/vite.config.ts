import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        tsconfigPaths(),
    ],
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@app': path.resolve(__dirname, './src/app'),
            '@features': path.resolve(__dirname, './src/features'),
            '@entities': path.resolve(__dirname, './src/entities'),
            '@shared': path.resolve(__dirname, './src/shared')
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('@tanstack')) {
                            return 'vendor-tanstack'
                        }
                        if (id.includes('react-dom') || id.includes('/react/')) {
                            return 'vendor-react'
                        }
                        if (id.includes('@reduxjs') || id.includes('react-redux')) {
                            return 'vendor-redux'
                        }
                        if (id.includes('date-fns')) {
                            return 'vendor-dates'
                        }
                    }
                    return undefined
                }
            }
        }
    }
});