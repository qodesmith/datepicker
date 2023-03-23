import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import './commonEnv.js'

export default defineConfig(({mode}) => {
  const isTest = mode === 'test'
  const envPortKey = isTest ? 'TEST_DEV_PORT' : 'DEV_PORT'
  const root = isTest ? './cypress/test-app' : './'
  const plugins = (() => {
    switch (mode) {
      case 'production':
        return [dts({rollupTypes: true})]
      case 'test':
        return []
      default:
        return [react()]
    }
  })()

  return {
    plugins,
    root,
    server: {
      host: true,
      port: +process.env[envPortKey],
    },
    build: {
      lib: {
        formats: ['umd', 'cjs', 'es'],
        entry: resolve(__dirname, 'src/datepicker.ts'),
        name: 'datepicker', // Exposed global variable.
        fileName: 'datepicker', // Name of the generated file.
      },
    },
    clearScreen: !isTest,
  }
})
