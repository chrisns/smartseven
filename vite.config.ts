import { defineConfig } from "vite"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa"
import vue from "@vitejs/plugin-vue"
import path from "path"

const pwaOptions: Partial<VitePWAOptions> = {
  base: "/",
  includeAssets: ["icon.png"],
  manifest: {
    name: "Daft Doris",
    short_name: "DAFTDORIS",
    theme_color: "#ffffff",
    icons: [],
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [vue(), VitePWA(pwaOptions)],
  define: {
    "process.env": {},
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      plugins: [nodeResolve()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
