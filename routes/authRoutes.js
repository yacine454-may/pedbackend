import express from 'express';
import { 
  login, 
  register, 
  getProfile, 
  logout,
  authenticateToken 
} from '../controlers/authController.js';

const router = express.Router();

// Routes publiques
router.post('/login', login);
router.post('/register', register);

// Routes protégées
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router; 