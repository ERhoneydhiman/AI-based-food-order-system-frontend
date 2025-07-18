import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from other devices
    port: 5173    ,
     allowedHosts: ['.ngrok-free.app'],   // (optional) Change if needed
  }
})
