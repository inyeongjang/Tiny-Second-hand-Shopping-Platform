const paymentService = require('../services/payment.service');

class PaymentController {
  // 거래 생성
  async createTransaction(req, res) {
    try {
      const transactionData = {
        ...req.body,
        buyerId: req.user.id // 현재 로그인한 사용자가 구매자
      };
      
      const transaction = await paymentService.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 거래 완료 처리
  async completeTransaction(req, res) {
    try {
      const { id } = req.params;
      const { paymentDetails } = req.body;
      
      const transaction = await paymentService.completeTransaction(id, paymentDetails);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 거래 취소/환불
  async refundTransaction(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const transaction = await paymentService.refundTransaction(id, reason);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 거래 내역 조회
  async getTransactions(req, res) {
    try {
      const { status, type, page, limit } = req.query;
      const userId = req.user.id;
      
      const result = await paymentService.getTransactions(userId, {
        status,
        type,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 단일 거래 상세 조회
  async getTransactionById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const transaction = await paymentService.getTransactionById(id, userId);
      res.json(transaction);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new PaymentController(); 