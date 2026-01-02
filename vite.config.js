import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FairDose',
        short_name: 'FairDose',
        description: 'Find affordable generic medicines',
        theme_color: '#0f766e',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png', // Temporary Pill Icon
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})