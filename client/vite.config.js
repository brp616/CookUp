import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  allowedHosts: [
      'https://cookup-1gl6.onrender.com/'
    ],
    preview: {
    allowedHosts: ['cookup-1gl6.onrender.com']
  },
  // Just in case you also see this in development mode later:
  server: {
    allowedHosts: ['cookup-1gl6.onrender.com']
  }
})
