import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";
import { reactClickToComponent } from "vite-plugin-react-click-to-component";

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd());

    if (!process.env.VITE_LAUNCH_EDITOR) {
        process.env.LAUNCH_EDITOR = "code";
    } else {
        process.env.LAUNCH_EDITOR = process.env.VITE_LAUNCH_EDITOR;
    }

    if (command === "serve") {
        // dev
        return {
            plugins: [reactClickToComponent(), react()],
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
            "/scanQR",
            "/makeQR",
            "/types",
            "/percentEncoding",
            "/textConvert",
        ];

        return {
            plugins: [
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