import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    sourcemap: false,       
    minify: "esbuild", 
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-ui': [
            '@fortawesome/react-fontawesome', 
            '@fortawesome/free-solid-svg-icons',
            'react-toastify'
          ],
          'vendor-stripe': [
            '@stripe/stripe-js', 
            '@stripe/react-stripe-js'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
  base: "/",
  server: { port: 5173 },
  preview: { port: 5173 },
});