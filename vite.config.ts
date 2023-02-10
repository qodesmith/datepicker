import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import './loadCommonEnv'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: +process.env.DEV_PORT,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/datepicker.ts'),
      name: 'datepicker',
      fileName: 'dp',
    },
  },
})
