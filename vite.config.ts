// C:\Users\172214836\SOS-Iguacu-Frontend\vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Definido como síncrono, pois não há importações dinâmicas ou assíncronas
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts', // Arquivo de setup para jest-dom e mocks globais
    globals: true,
    coverage: {
      provider: 'v8', // Garante o uso do provedor correto
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})