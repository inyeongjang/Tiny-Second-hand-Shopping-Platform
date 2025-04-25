const { User, Product, Report, Transaction } = require('../../models');

class AdminService {
  // 사용자 목록 조회
  async getUsers(filters = {}) {
    try {
      const { page = 1, limit = 10, isActive, isBlacklisted } = filters;
      
      const where = {};
      if (isActive !== undefined) where.isActive = isActive;
      if (isBlacklisted !== undefined) where.isBlacklisted = isBlacklisted;

      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: ['id', 'email', 'nickname', 'profileImage', 'rating', 'isActive', 'isBlacklisted', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        users,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error('Failed to get users: ' + error.message);
    }
  }

  // 상품 목록 조회
  async getProducts(filters = {}) {
    try {
      const { page = 1, limit = 10, status, categoryId } = filters;
      
      const where = {};
      if (status) where.status = status;
      if (categoryId) where.categoryId = categoryId;

      const offset = (page - 1) * limit;

      const { count, rows: products } = await Product.findAndCountAll({
        where,
        include: [
          { model: User, as: 'seller', attributes: ['id', 'nickname'] },
          { model: User, as: 'buyer', attributes: ['id', 'nickname'] }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        products,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error('Failed to get products: ' + error.message);
    }
  }

  // 신고 목록 조회
  async getReports(filters = {}) {
    try {
      const { page = 1, limit = 10, status, type } = filters;
      
      const where = {};
      if (status) where.status = status;
      if (type) where.type = type;

      const offset = (page - 1) * limit;

      const { count, rows: reports } = await Report.findAndCountAll({
        where,
        include: [
          { model: User, as: 'reporter', attributes: ['id', 'nickname'] },
          { model: User, as: 'reportedUser', attributes: ['id', 'nickname'] },
          { model: Product, as: 'reportedProduct', attributes: ['id', 'title'] }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        reports,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
          limit
        }
      };
    } catch (error) {
      throw new Error('Failed to get reports: ' + error.message);
    }
  }

  // 거래 내역 조회
  async getTransactions(filters = {}) {
    try {
      const { page = 1, limit = 10, status } = filters;
      
      const where = {};
      if (status) where.status = status;

      const offset = (page - 1) * limit;

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where,
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'nickname'] },
          { model: User, as: 'seller', attributes: ['id', 'nickname'] },
          { model: Product, as: 'product', attributes: ['id', 'title'] }
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

  // 사용자 상태 변경
  async updateUserStatus(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      await user.update(updateData);
      return user;
    } catch (error) {
      throw new Error('Failed to update user status: ' + error.message);
    }
  }

  // 상품 상태 변경
  async updateProductStatus(productId, status) {
    try {
      const product = await Product.findByPk(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      await product.update({ status });
      return product;
    } catch (error) {
      throw new Error('Failed to update product status: ' + error.message);
    }
  }

  // 신고 처리
  async processReport(reportId, status, adminNote) {
    try {
      const report = await Report.findByPk(reportId);
      
      if (!report) {
        throw new Error('Report not found');
      }

      await report.update({ status, adminNote });
      return report;
    } catch (error) {
      throw new Error('Failed to process report: ' + error.message);
    }
  }
}

module.exports = new AdminService(); 