import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.File({ filename: 'logs/logviewer.log' })],
});

// If we're not in production, log to the console
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
    );
}

// Create a wrapper function to add module information
export const getLogger = (moduleName: string) => {
    return {
        error: (message: string, meta: object = {}) => {
            logger.error(message, { ...meta, module: moduleName });
        },
        warn: (message: string, meta: object = {}) => {
            logger.warn(message, { ...meta, module: moduleName });
        },
        info: (message: string, meta: object = {}) => {
            logger.info(message, { ...meta, module: moduleName });
        },
        debug: (message: string, meta: object = {}) => {
            logger.debug(message, { ...meta, module: moduleName });
        },
    };
};

export default logger;
