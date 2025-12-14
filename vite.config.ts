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
    host: '0.0.0.0', // Permite acesso local e remoto
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },

  build: {
    target: "esnext",
    outDir: "dist",
  },
});
