import {defineConfig} from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },

    // Provides a "run all" button in the test runner UI
    experimentalRunAllSpecs: true,
  },
  env: require('./commonEnv.js'),
  video: false,
  screenshotOnRunFailure: false,
})
