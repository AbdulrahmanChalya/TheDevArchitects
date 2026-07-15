import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { copyFileSync, mkdirSync } from "node:fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const staticDataFiles = ["airports.json", "destinations.json", "recommendations.json"];

function copyStaticData() {
  return {
    name: "copy-static-data",
    closeBundle() {
      const targetDir = path.resolve(import.meta.dirname, "dist/public/backend");
      mkdirSync(targetDir, { recursive: true });

      for (const fileName of staticDataFiles) {
        copyFileSync(
          path.resolve(import.meta.dirname, "../backend", fileName),
          path.join(targetDir, fileName),
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyStaticData(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner()
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  envDir: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
