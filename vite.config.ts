import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import Sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    if (command === 'serve') { // dev
        return {
            plugins: [
                react()
            ],
            build: {
                sourcemap: false,
            }
        }
    } else {
        // command === 'build'

        const dynamicRoutes = [
            "/",
            "/legal",
            "/imageConvert",
            "/imageConvertPDF",
            "/pdfConvertImages",       
            "/scanQR",       
            "/makeQR",       
            "/types"
        ]

        return {
            plugins: [
                Sitemap({ hostname: 'https://media-local-tools.vercel.app/', dynamicRoutes }),
                react(),
                VitePWA({
                    registerType: 'autoUpdate',
                    includeAssets: ['logo.ico'],
                    manifest: {
                        name: 'Local Tools',
                        short_name: 'Local Tools',
                        description: 'Collections of web base tools, no server uploading, privacy, efficiency, free, open sources',
                        theme_color: '#ffffff',
                        icons: [
                            {
                                src: 'logo.ico',
                                sizes: '192x192',
                                type: 'image/x-icon'
                            }
                        ]
                    }
                })
            ],
            esbuild: {
                drop: ['console', 'debugger'],
            },
            build: {
                sourcemap: false,
            }
        }
    }
})
