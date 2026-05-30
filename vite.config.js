import { copyFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const staticFiles = [
  "app.js",
  "styles.css",
  "sw.js",
  "supabase-config.js",
  "manifest.webmanifest",
  "icon.svg",
  "changelog.json",
  "components/items.js",
  "components/meals.js",
  "components/purchases.js",
  "components/categories.js",
  "src/router.js",
  "src/auth.js",
];

function copyPwaStaticFiles() {
  return {
    name: "copy-pwa-static-files",
    async writeBundle() {
      const root = process.cwd();
      const outDir = resolve(root, "dist");
      await mkdir(outDir, { recursive: true });
      for (const file of staticFiles) {
        const source = resolve(root, file);
        const dest = resolve(outDir, file);
        await mkdir(dirname(dest), { recursive: true });
        await copyFile(source, dest);
      }
    },
  };
}

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        app: resolve(__dirname, "app.html"),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "assets/[name][extname]";
          return "[name][extname]";
        },
      },
      onwarn(warning, warn) {
        if (warning.message?.includes("can't be bundled without type=\"module\" attribute")) return;
        warn(warning);
      },
    },
  },
  plugins: [
    tailwindcss(),
    copyPwaStaticFiles(),
    {
      name: "app-spa-fallback",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/app" || req.url.startsWith("/app/")) {
            req.url = "/app.html";
          }
          next();
        });
      },
    },
  ],
});
