import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";
import { reactClickToComponent } from "vite-plugin-react-click-to-component";

function ffmpegCoreAssets(): Plugin {
    const assets = {
        "/ffmpeg/ffmpeg-core.js": {
            path: resolve("node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js"),
            mimeType: "text/javascript",
        },
        "/ffmpeg/ffmpeg-core.wasm": {
            path: resolve("node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm"),
            mimeType: "application/wasm",
        },
    };

    return {
        name: "local-ffmpeg-core-assets",
        configureServer(server) {
            server.middlewares.use((request, response, next) => {
                const requestPath = request.url?.split("?")[0] as keyof typeof assets;
                const asset = assets[requestPath];
                if (!asset) {
                    next();
                    return;
                }

                response.statusCode = 200;
                response.setHeader("Content-Type", asset.mimeType);
                response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
                response.end(readFileSync(asset.path));
            });
        },
        generateBundle() {
            for (const [requestPath, asset] of Object.entries(assets)) {
                this.emitFile({
                    type: "asset",
                    fileName: requestPath.slice(1),
                    source: readFileSync(asset.path),
                });
            }
        },
    };
}

export default defineConfig(({ command }) => {
    if (!process.env.VITE_LAUNCH_EDITOR) {
        process.env.LAUNCH_EDITOR = "code";
    } else {
        process.env.LAUNCH_EDITOR = process.env.VITE_LAUNCH_EDITOR;
    }

    if (command === "serve") {
        // dev
        return {
            plugins: [ffmpegCoreAssets(), reactClickToComponent(), react()],
            build: {
                sourcemap: false,
            },
            resolve: {
                tsconfigPaths: true,
            },
        } as any;
    } else {
        // command === 'build'

        const dynamicRoutes = [
            "/",
            "/legal",
            "/imageConvert",
            "/imageConvertPDF",
            "/pdfConvertImages",
            "/pdfOrganizer",
            "/videoEditor",
            "/scanQR",
            "/makeQR",
            "/types",
            "/percentEncoding",
            "/textConvert",
        ];

        return {
            plugins: [
                ffmpegCoreAssets(),
                reactClickToComponent(),
                Sitemap({
                    hostname: "https://media-local-tools.vercel.app/",
                    dynamicRoutes,
                }),
                react(),
                VitePWA({
                    registerType: "autoUpdate",
                    includeAssets: ["logo.ico"],
                    manifest: {
                        name: "Local Tools",
                        short_name: "Local Tools",
                        description:
                            "Collections of web base tools, no server uploading, privacy, efficiency, free, open sources",
                        theme_color: "#ffffff",
                        icons: [
                            {
                                src: "logo.ico",
                                sizes: "192x192",
                                type: "image/x-icon",
                            },
                        ],
                    },
                    workbox: {
                        globIgnores: ["**/ffmpeg/**"],
                        runtimeCaching: [
                            {
                                urlPattern: /\/ffmpeg\/ffmpeg-core\.(?:js|wasm)$/,
                                handler: "CacheFirst",
                                options: {
                                    cacheName: "ffmpeg-core-0.12.10",
                                    expiration: { maxEntries: 2 },
                                },
                            },
                        ],
                    },
                }),
            ],
            oxc: {
                drop: ["console", "debugger"],
            },
            build: {
                sourcemap: false,
            },
        };
    }
});
