const { Transaction, User, Product } = require('../../models');

class PaymentService {
  // 거래 생성
  async createTransaction(transactionData) {
    try {
      const { buyerId, sellerId, productId, amount, paymentMethod, description } = transactionData;

      // 구매자와 판매자 확인
      const buyer = await User.findByPk(buyerId);
      const seller = await User.findByPk(sellerId);
      const product = await Product.findByPk(productId);

      if (!buyer || !seller || !product) {
        throw new Error('Invalid buyer, seller, or product');
      }

      // 거래 생성
      const transaction = await Transaction.create({
        buyerId,
        sellerId,
        productId,
        amount,
        paymentMethod,
        description,
        status: 'pending'
      });

      return transaction;
    } catch (error) {
      throw new Error('Failed to create transaction: ' + error.message);
    }
  }

  // 거래 완료 처리
  async completeTransaction(transactionId, paymentDetails) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'pending') {
        throw new Error('Transaction is not in pending state');
      }

      // 여기에 실제 결제 처리 로직 추가 (예: PG사 연동)
      
      await transaction.update({
        status: 'completed',
        transactionId: paymentDetails.transactionId
      });

      return transaction;
    } catch (error) {
      throw new Error('Failed to complete transaction: ' + error.message);
    }
  }

  // 거래 취소/환불
  async refundTransaction(transactionId, reason) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Only completed transactions can be refunded');
      }

      // 여기에 실제 환불 처리 로직 추가
      
      await transaction.update({
        status: 'refunded',
        description: reason
      });

      return transaction;
    } catch (error) {
      throw new Error('Failed to refund transaction: ' + error.message);
    }
  }

  // 거래 내역 조회
  async getTransactions(userId, filters = {}) {
    try {
      const { status, type, page = 1, limit = 10 } = filters;
      
      const where = {};
      if (status) where.status = status;
      
      // type이 'buyer'면 buyerId로, 'seller'면 sellerId로 필터링
      if (type === 'buyer') {
        where.buyerId = userId;
      } else if (type === 'seller') {
        where.sellerId = userId;
      }

      const offset = (page - 1) * limit;

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where,
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'nickname', 'profileImage'] },
          { model: User, as: 'seller', attributes: ['id', 'nickname', 'profileImage'] },
          { model: Product, as: 'product', attributes: ['id', 'title', 'price'] }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        transactions,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error('Failed to get transactions: ' + error.message);
    }
  }

  // 단일 거래 상세 조회
  async getTransactionById(transactionId, userId) {
    try {
      const transaction = await Transaction.findByPk(transactionId, {
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'nickname', 'profileImage'] },
          { model: User, as: 'seller', attributes: ['id', 'nickname', 'profileImage'] },
          { model: Product, as: 'product', attributes: ['id', 'title', 'price'] }
        ]
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // 거래 관련자만 조회 가능
      if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
        throw new Error('Not authorized to view this transaction');
      }

      return transaction;
    } catch (error) {
      throw new Error('Failed to get transaction: ' + error.message);
    }
  }
}

module.exports = new PaymentService(); 