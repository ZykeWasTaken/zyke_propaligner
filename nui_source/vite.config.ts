import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "./",
    build: {
        outDir: "./../nui",
        assetsDir: "",
        rollupOptions: {
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]",
            },
        },
    },
    server: {
        host: "127.0.0.1",
        port: 5173, // Ensure the port matches your wrapper script
    },
});
