import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/datepicker.ts'),
      name: 'datepicker',
      fileName: 'dp',
    },
  },
})
