
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://azuritaa33.sg-host.com", // Solo la URL base del servidor
        changeOrigin: true,
        secure: true, // Cambia a true para HTTPS
        rewrite: (path) => path, // No reescribas la ruta
      },
    },
  },
});