const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-email', authController.checkEmail);
router.get('/check-nickname', authController.checkNickname);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router; 