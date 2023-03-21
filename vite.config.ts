import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import './commonEnv.js'

export default defineConfig(({mode}) => {
  const isTest = mode === 'test'
  const envPortKey = isTest ? 'TEST_DEV_PORT' : 'DEV_PORT'
  const plugins = isTest ? [] : [react()]
  const root = isTest ? './cypress/test-app' : './'

  return {
    plugins,
    root,
    server: {
      host: true,
      port: +process.env[envPortKey],
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/datepicker.ts'),
        name: 'datepicker',
        fileName: 'datepicker',
      },
    },
    clearScreen: !isTest,
  }
})
