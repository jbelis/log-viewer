import { Repository } from 'typeorm';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { getLogger } from '../utils/logger';

const logger = getLogger('AuthService');

export class AuthService {
    constructor(private userRepository: Repository<User>) {}

    async register(username: string, password: string): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User();
        user.username = username;
        user.passwordHash = passwordHash;

        try {
            const savedUser = await this.userRepository.save(user);
            logger.info('User registered successfully', { username });
            return savedUser;
        } catch (error) {
            logger.error('Error registering user', { error });
            throw error;
        }
    }

    async authenticate(username: string, password: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({ where: { username } });
            if (!user) {
                logger.warn('Authentication failed: user not found', { username });
                return null;
            }

            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                logger.warn('Authentication failed: invalid password', { username });
                return null;
            }

            logger.info('User authenticated successfully', { username });
            return user;
        } catch (error) {
            logger.error('Error during authentication', { error });
            throw error;
        }
    }
}
