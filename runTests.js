/**
 * Why does this file exist?
 *
 * I'm trying to keep the `.common.env` file as the single source of truth for
 * localhost-related values for the dev and test environments.
 */

const {execSync} = require('node:child_process')
const envVariables = require('./commonEnv.js')
const {TEST_DEV_LOCALHOST} = envVariables
const {parseArgs} = require('node:util')
const config = {
  options: {
    type: {
      type: 'string', // 'open' or 'run'
    },
  },
}

const {type} = parseArgs(config).values

execSync(
  `./node_modules/.bin/start-server-and-test dev-test ${TEST_DEV_LOCALHOST} cy:${type}`,
  {stdio: 'inherit'}
)
