const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// 일반 신고 생성 (기존 엔드포인트 유지)
router.post('/', authMiddleware, reportController.createReport);

// 상품 신고 생성
router.post('/product', authMiddleware, reportController.createProductReport);

// 사용자 신고 생성
router.post('/user', authMiddleware, reportController.createUserReport);

// 신고 목록 조회 (관리자용)
router.get('/', authMiddleware, adminMiddleware, reportController.getReports);

// 신고 상세 조회
router.get('/:id', authMiddleware, reportController.getReport);

// 신고 처리 (관리자용)
router.patch('/:id/process', authMiddleware, adminMiddleware, reportController.processReport);

module.exports = router; 