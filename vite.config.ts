import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const target = env.VITE_API_URL;

    return {
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(process.cwd(), "./src"),
            },
        },
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: target,
                    changeOrigin: true,
                },
            },
        },
    }
})
