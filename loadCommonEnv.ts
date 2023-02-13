import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

const envConfig = dotenv.config({path: './.common.env'})

// Allows previously declared variables to be used as values.
dotenvExpand.expand(envConfig)

export default envConfig
