/**
 * Why does this file exist?
 *
 * I'm trying to keep the `.common.env` file as the single source of truth for
 * localhost-related values for the dev and test environments.
 */

const {execSync} = require('node:child_process')
const envVariables = require('./commonEnv.js')
const {TEST_DEV_LOCALHOST} = envVariables

execSync(
  `./node_modules/.bin/start-server-and-test dev-test ${TEST_DEV_LOCALHOST} cy:open`,
  {stdio: 'inherit'}
)
