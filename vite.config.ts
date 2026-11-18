import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import devServer from "@hono/vite-dev-server";

export default defineConfig({
  plugins: [
    tailwindcss(),
    devServer({
      entry: "./src/index.tsx",
    }),
  ],

  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    manifest: true,

    rollupOptions: {
      input: "./src/client.ts",
      output: {
        entryFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});