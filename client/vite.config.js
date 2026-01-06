import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // Listen on all interfaces (0.0.0.0) so Docker exposes it
    port: 5173,   // optional, default Vite port
    strictPort: true // fail if port is busy
  }
})
