import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext", // Permet l'utilisation de top-level await
    minify: "esbuild", // Utilise esbuild pour minifier
    rollupOptions: {
      input: {
        main: "./index.html", // Page principale
        form: "./form.html", // Page formulaire
        
      },
    },
  },
});
