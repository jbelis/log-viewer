import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { DataSource } from 'typeorm';

import logger from './utils/logger';
import { AuthMiddleware } from './middleware/auth';
import { AppDataSource } from './database/connection';
import { LogsMiddleware } from './middleware/logs';

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
};

// Session configuration
async function bootstrap() {
    logger.info('Starting application');
    try {
        const connection:DataSource = await AppDataSource.initialize();
        logger.info('Database connection established');

        //        app.use(auth(config));
        app.use(express.json());

        // Apply CORS middleware
        app.use(cors(corsOptions));

        app.use(express.static('public'));

        app.use(
            session({
                secret: process.env.SESSION_SECRET || 'default-secret-key-change-me',
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: false, //process.env.NODE_ENV === 'production',
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                },
            }),
        );

        app.use(
            fileUpload({
                limits: { fileSize: 50 * 1024 * 1024 },
            }),
        );

        const logsMiddleware = new LogsMiddleware(connection);
        app.use(logsMiddleware.getRouter());
        logsMiddleware.startProcessing();

        const authMiddleware = new AuthMiddleware(connection);
        app.use(authMiddleware.getRouter());

        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });

    } catch (error) {
        logger.error(`Failed to start application ${error}`);
        console.error('failed to start application', { error });
        process.exit(1);
    }
}

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', {
        promise,
        reason,
    });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error });
    process.exit(1);
});

bootstrap().catch((error) => {
    logger.error('Bootstrap error:', { error });
    process.exit(1);
});
