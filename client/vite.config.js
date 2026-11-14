import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import seo from './vite-plugin-seo.js'
import photos from './vite-plugin-photos.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // photos() turns `photo:` imports of public/ images into responsive WebP
  // files. seo() writes each page's search and link-preview tags into its own
  // HTML file (with the page's code, styles and main picture preloaded) and
  // builds sitemap.xml; it reads books and events with the same public
  // Supabase settings the app uses.
  plugins: [photos(), react(), tailwindcss(), seo({ env: loadEnv(mode, process.cwd(), 'VITE_') })],
  build: {
    // Everything the build names by content hash (scripts, styles, fonts,
    // resized photos) goes in /static, apart from public/assets, so vercel.json
    // can cache it for a year without also freezing images that are replaced
    // under the same name.
    assetsDir: 'static',
    rolldownOptions: {
      output: {
        // Libraries in their own files: they change rarely, so browsers keep
        // them cached across site updates, and the app's own code stays small.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 20 },
            { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
}))
