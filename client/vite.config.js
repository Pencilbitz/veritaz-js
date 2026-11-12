import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import seo from './vite-plugin-seo.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // seo() writes each page's search and link-preview tags into its own HTML
  // file and builds sitemap.xml; it reads books and events with the same
  // public Supabase settings the app uses.
  plugins: [react(), tailwindcss(), seo({ env: loadEnv(mode, process.cwd(), 'VITE_') })],
  server: {
    port: 5173,
    host: true,
  },
}))
