import dotenv from 'dotenv'
dotenv.config({path:'./.env'})
import mongoose from 'mongoose'
import { app } from './app'
import { logger } from './utils/ErrorHandler/logger'

process.on('uncaughtException',(err)=>{
    console.log(err.name,err.message)
    console.log('Uncaught Exception occured! Shutting down')
    process.exit(1)
})

// connecting server
const PORT = process.env.PORT || 3000
const server = app.listen(PORT,async ()=>{
    logger.info('Server is listening on port '+PORT)
})

// connecting database
mongoose.connect(process.env.MONGO_URL).then(()=>{
    logger.info('Database is connected')
})

process.on('unhandledRejection',(err:Error)=>{
    console.log(err.name,err.message)
    console.log('Unhandeld rejection occured! shutting down..')
    server.close(()=>{
        process.exit(1)
    })
})