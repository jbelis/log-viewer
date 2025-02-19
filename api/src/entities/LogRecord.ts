import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum LogSeverity {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL',
}

@Entity('log_records')
export class LogRecord {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({
        name: 'log_date',
        type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp with time zone',
    })
    @Index()
    logDate!: Date;

    @Column({
        type: 'varchar',
        length: 8,
        transformer: {
            to: (value: LogSeverity) => value,
            from: (value: string) => value as LogSeverity,
        },
    })
    severity!: LogSeverity;

    @Column()
    service!: string;

    @Column({ length: 255 })
    message!: string;
}
