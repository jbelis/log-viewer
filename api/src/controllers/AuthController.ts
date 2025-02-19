import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { getLogger } from '../utils/logger';

const logger = getLogger('AuthController');

declare module 'express-session' {
    interface SessionData {
        userId: number;
        username: string;
    }
}

export class AuthController {
    constructor(private authService: AuthService) {}

    async register(req: Request, res: Response): Promise<void> {
        logger.info('registering user');

        if (!req.body) {
            res.status(400).json({ error: 'request body not found' });
            return;
        }

        const { username, password } = req.body;
        logger.info('registering user', { username });

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        try {
            const user = await this.authService.register(username, password);
            res.status(201).json({
                message: 'User registered successfully',
                userId: user.id,
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Username already exists') {
                res.status(409).json({ error: error.message });
            } else {
                logger.error('Registration error', { error });
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        try {
            const user = await this.authService.authenticate(username, password);
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Set session data
            req.session.userId = user.id;
            req.session.username = user.username;

            res.json({
                message: 'Login successful',
                username: user.username,
            });
        } catch (error) {
            logger.error('Login error', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        req.session.destroy((err) => {
            if (err) {
                logger.error('Logout error', { error: err });
                res.status(500).json({ error: 'Error during logout' });
                return;
            }
            res.json({ message: 'Logout successful' });
        });
    }

    async getCurrentUser(req: Request, res: Response): Promise<void> {
        if (!req.session.userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        res.json({
            userId: req.session.userId,
            username: req.session.username,
        });
    }
}
