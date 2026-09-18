import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Démo : / = page de démo (écran de chargement et sélecteur), /v1/ = version classique (src),
// /v2/ = version immersive (src-v2). Les deux versions sont chargées ensemble au démarrage.
export default defineConfig({
  plugins: [react()],
  build: {
    // La scène 3D de l'enseigne (Three.js, ~590 Ko minifiés, 150 Ko compressés) est un morceau chargé à part
    chunkSizeWarningLimit: 650,
    rolldownOptions: {
      input: {
        demo: 'index.html',
        v1: 'v1/index.html',
        v2: 'v2/index.html',
      },
    },
  },
})
