import { defineConfig } from "vite";
import path, { resolve } from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "./",
  build:{
emptyOutDir:false,
manifest:true,
outDir:"dist",
rollupOptions:{
  input:{
    main:resolve(__dirname,'index.html'),
    studio_main:resolve(__dirname,'studio.html'),
    webcam_main:resolve(__dirname,'webcam.html')
  }
}

  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tsConfigPaths(),
    tailwindcss(),
    electron({
      main: {
        entry: "electron/main.ts",
        onstart({ startup }) {
          // Some terminals set this for Node tooling; Electron must not inherit it.
          delete process.env.ELECTRON_RUN_AS_NODE;
          startup();
        },
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
