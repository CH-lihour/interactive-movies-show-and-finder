import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves from a subpath; Vercel serves from the domain root.
  base: process.env.VERCEL ? '/' : '/interactive-movies-show-and-finder/',
  plugins: [react()],
})
