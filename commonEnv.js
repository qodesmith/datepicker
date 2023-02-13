const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const envConfig = dotenv.config({path: './.common.env'})

// Allows previously declared variables to be used as values.
dotenvExpand.expand(envConfig)

// Export the variables if a consuming module needs them.
module.exports = envConfig.parsed ?? {}
