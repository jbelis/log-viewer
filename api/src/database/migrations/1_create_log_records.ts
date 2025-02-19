import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateLogRecords1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'log_records',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'log_date',
                        type: 'timestamp with time zone',
                        isNullable: false,
                    },
                    {
                        name: 'severity',
                        type: 'varchar',
                        length: '8',
                        isNullable: false,
                    },
                    {
                        name: 'service',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'message',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'log_records',
            new TableIndex({
                name: 'IDX_LOG_DATE',
                columnNames: ['log_date'],
            }),
        );

        await queryRunner.createIndex(
            'log_records',
            new TableIndex({
                name: 'IDX_MESSAGE',
                columnNames: ['message'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('log_records');
    }
}
