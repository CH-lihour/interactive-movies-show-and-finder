import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://ch-lihour.github.io/interactive-movies-show-and-finder/
  base: '/interactive-movies-show-and-finder/',
  plugins: [react()],
})
