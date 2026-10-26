import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";
import { tabToComponents } from "tab-to-components";
// import { reactClickToComponent } from "vite-plugin-react-click-to-component";

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
                    source: new Uint8Array(readFileSync(asset.path)),
                });
            }
        },
    };
}

function tesseractAssets(): Plugin {
    const coreFiles = [
        "tesseract-core-lstm.js",
        "tesseract-core-lstm.wasm",
        "tesseract-core-lstm.wasm.js",
        "tesseract-core-simd-lstm.js",
        "tesseract-core-simd-lstm.wasm",
        "tesseract-core-simd-lstm.wasm.js",
        "tesseract-core-relaxedsimd-lstm.js",
        "tesseract-core-relaxedsimd-lstm.wasm",
        "tesseract-core-relaxedsimd-lstm.wasm.js",
    ];
    const assets: Record<string, { path: string; mimeType: string }> = {
        "/tesseract/worker.min.js": {
            path: resolve("node_modules/tesseract.js/dist/worker.min.js"),
            mimeType: "text/javascript",
        },
        "/tesseract/lang/eng.traineddata.gz": {
            path: resolve("node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz"),
            mimeType: "application/gzip",
        },
        "/tesseract/lang/chi_sim.traineddata.gz": {
            path: resolve(
                "node_modules/@tesseract.js-data/chi_sim/4.0.0_best_int/chi_sim.traineddata.gz",
            ),
            mimeType: "application/gzip",
        },
        "/tesseract/lang/chi_tra.traineddata.gz": {
            path: resolve(
                "node_modules/@tesseract.js-data/chi_tra/4.0.0_best_int/chi_tra.traineddata.gz",
            ),
            mimeType: "application/gzip",
        },
    };

    for (const fileName of coreFiles) {
        assets[`/tesseract/core/${fileName}`] = {
            path: resolve(`node_modules/tesseract.js-core/${fileName}`),
            mimeType: fileName.endsWith(".wasm") ? "application/wasm" : "text/javascript",
        };
    }

    return {
        name: "local-tesseract-assets",
        configureServer(server) {
            server.middlewares.use((request, response, next) => {
                const requestPath = request.url?.split("?")[0];
                const asset = requestPath ? assets[requestPath] : undefined;
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
                    source: new Uint8Array(readFileSync(asset.path)),
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
            plugins: [
                ffmpegCoreAssets(),
                tesseractAssets(),
                // reactClickToComponent(),
                tabToComponents({
                    editor: process.env.LAUNCH_EDITOR || "code",
                }),
                react(),
            ],
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
            "/imageToText",
            "/luckyDraw",
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
                tesseractAssets(),
                // reactClickToComponent(),
                tabToComponents({
                    editor: process.env.LAUNCH_EDITOR || "code",
                }),
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
                        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm,gz}"],
                        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
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
