import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": "/src/app",
      "@features": "/src/features",
      "@shared": "/src/shared"
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173
  },
  build: {
    chunkSizeWarningLimit: 1200,
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["echarts", "echarts-for-react"],
          react: ["react", "react-dom"]
        }
      }
    },
    sourcemap: true
  }
});
