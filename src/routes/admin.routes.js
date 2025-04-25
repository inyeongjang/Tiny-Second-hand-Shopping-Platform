const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// 모든 관리자 라우트는 인증과 관리자 권한이 필요합니다
router.use(authMiddleware);
router.use(adminMiddleware);

// 사용자 관리
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/status', adminController.updateUserStatus);

// 상품 관리
router.get('/products', adminController.getProducts);
router.patch('/products/:productId/status', adminController.updateProductStatus);

// 신고 관리
router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId/process', adminController.processReport);

// 거래 관리
router.get('/transactions', adminController.getTransactions);

module.exports = router; 