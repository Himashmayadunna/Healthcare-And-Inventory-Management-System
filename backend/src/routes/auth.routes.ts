import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { loginRules } from '../validators/rules';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', loginRules, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);

export default router;
