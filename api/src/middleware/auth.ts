import { Request, Response, NextFunction } from 'express';
import { getLogger } from '../utils/logger';
import { Repository } from 'typeorm';
import express from 'express';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { AuthService } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';

const logger = getLogger('AuthMiddleware');


export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    } else {
        logger.info('User authenticated', { userId: req.session.userId });
    }
    next();
}

export class AuthMiddleware {
    private router: express.Router;
    private userRepository: Repository<User>;

    constructor(connection: DataSource) {
        this.userRepository = connection.getRepository(User);
        this.router = this.initRouter();
    }

    private initRouter() {
        const router = express.Router();
        const authService = new AuthService(this.userRepository);
        const authController = new AuthController(authService);

        router.post('/api/auth/login', (req, res) => authController.login(req, res));
        router.post('/api/auth/logout', (req, res) => authController.logout(req, res));
        router.get('/api/auth/me', (req, res) => authController.getCurrentUser(req, res));
        router.post('/api/auth/register', (req, res) => authController.register(req, res));
        return router;
    }

    getRouter() {
        return this.router;
    }
}