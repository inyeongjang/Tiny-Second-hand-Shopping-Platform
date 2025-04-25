const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 거래 생성
router.post('/', paymentController.createTransaction);

// 거래 완료 처리
router.post('/:id/complete', paymentController.completeTransaction);

// 거래 취소/환불
router.post('/:id/refund', paymentController.refundTransaction);

// 거래 내역 조회
router.get('/', paymentController.getTransactions);

// 단일 거래 상세 조회
router.get('/:id', paymentController.getTransactionById);

module.exports = router; 