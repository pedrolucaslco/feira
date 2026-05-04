import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const staticFiles = ["app.js", "styles.css", "sw.js", "supabase-config.js", "manifest.webmanifest", "icon.svg"];

function copyPwaStaticFiles() {
  return {
    name: "copy-pwa-static-files",
    async writeBundle() {
      const root = process.cwd();
      const outDir = resolve(root, "dist");
      await mkdir(outDir, { recursive: true });
      await Promise.all(staticFiles.map((file) => copyFile(resolve(root, file), resolve(outDir, file))));
    },
  };
}

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        app: resolve(__dirname, "index.html"),
        landing: resolve(__dirname, "landing-page.html"),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "assets/[name][extname]";
          return "[name][extname]";
        },
      },
    },
  },
  plugins: [tailwindcss(), copyPwaStaticFiles()],
});
