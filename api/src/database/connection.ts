import { DataSource } from 'typeorm';
import 'dotenv/config';

import { LogRecord } from '../entities/LogRecord';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [LogRecord, User],
    migrations: [process.env.DB_MIGRATIONS || 'src/database/migrations/*.ts'],
    synchronize: false,
    logging: true,
});
