import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1739892681000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'bigint',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: 'password_hash',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Create index on username for faster lookups
        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'IDX_USERS_USERNAME',
                columnNames: ['username'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
