import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    host: true,
    port: 5000,
    strictPort: true,

    // ✅ LIBERA QUALQUER HOST (Replit incluído)
    allowedHosts: true,

    hmr: {
      clientPort: 443,
    },
  },

  build: {
    target: "esnext",
    outDir: "build",
  },
});
