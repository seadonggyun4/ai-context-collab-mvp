import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": path.resolve(projectRoot, "src/app"),
      "@pages": path.resolve(projectRoot, "src/pages"),
      "@widgets": path.resolve(projectRoot, "src/widgets"),
      "@features": path.resolve(projectRoot, "src/features"),
      "@entities": path.resolve(projectRoot, "src/entities"),
      "@shared": path.resolve(projectRoot, "src/shared"),
      "@test": path.resolve(projectRoot, "src/test"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5174,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/@codemirror/lang-")
            || id.includes("/node_modules/@lezer/markdown/")
            || id.includes("/node_modules/@lezer/yaml/")
          ) return "editor-languages";
          if (id.includes("/node_modules/@codemirror/search/")) return "editor-search";
          if (id.includes("/node_modules/@codemirror/") || id.includes("/node_modules/@lezer/")) return "editor-core";
          if (id.includes("/node_modules/yaml/")) return "yaml-runtime";
          return undefined;
        },
      },
    },
  },
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/test/**"],
    },
  },
});
