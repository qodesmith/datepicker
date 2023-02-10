import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

const envConfig = dotenv.config({path: './.common.env'})
dotenvExpand.expand(envConfig)

export default envConfig
