import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column({ name: 'password_hash' })
    passwordHash!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date = new Date();

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date = new Date();
}
