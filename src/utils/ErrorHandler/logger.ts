import bunyan,{LogLevel} from 'bunyan'

export const logger = bunyan.createLogger({
    name:'test-service',
    streams:[
        {
            stream:process.stdout,
            level:('info')as LogLevel
        }
    ]
})
