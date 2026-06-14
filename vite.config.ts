import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Jokko Santé — Coordination inter-hospitalière',
        short_name: 'Jokko',
        description: 'Carte nationale des lits et coordination des transferts inter-hospitaliers en temps réel.',
        lang: 'fr',
        theme_color: '#0B5E59',
        background_color: '#0F172A',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: null,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Découpage des dépendances lourdes en chunks distincts (cache + chargement).
        // Le runtime React pur est isolé dans une « feuille » sans dépendance
        // croisée ; tout le reste (react-router et ses deps, formulaires…) reste
        // groupé pour éviter les dépendances circulaires entre chunks (TDZ).
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory')) return 'charts'
          if (id.includes('leaflet')) return 'map'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('@tanstack')) return 'query'
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/react-is/') ||
            id.includes('/scheduler/')
          )
            return 'react'
          return 'vendor'
        },
      },
    },
  },
})
