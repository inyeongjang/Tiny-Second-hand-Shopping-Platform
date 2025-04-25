const { Report, User, Product } = require('../../models');

class ReportService {
  // 신고 생성
  async createReport(reportData) {
    try {
      const report = await Report.create(reportData);
      return report;
    } catch (error) {
      throw new Error('Failed to create report: ' + error.message);
    }
  }

  // 신고 목록 조회 (관리자용)
  async getReports(filters = {}) {
    try {
      const { status, type, page = 1, limit = 10 } = filters;
      
      const where = {};
      if (status) where.status = status;
      if (type) where.type = type;

      const offset = (page - 1) * limit;

      const { count, rows: reports } = await Report.findAndCountAll({
        where,
        include: [
          { model: User, as: 'reporter' },
          { model: User, as: 'reportedUser' },
          { model: Product, as: 'reportedProduct' }
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

  // 신고 상세 조회
  async getReportById(id) {
    try {
      const report = await Report.findByPk(id, {
        include: [
          { model: User, as: 'reporter' },
          { model: User, as: 'reportedUser' },
          { model: Product, as: 'reportedProduct' }
        ]
      });

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    } catch (error) {
      throw new Error('Failed to get report: ' + error.message);
    }
  }

  // 신고 처리
  async processReport(id, adminId, status, adminNote) {
    try {
      const report = await Report.findByPk(id);
      
      if (!report) {
        throw new Error('Report not found');
      }

      // 신고 상태 업데이트
      await report.update({
        status,
        adminNote
      });

      // 사용자 신고인 경우 블랙리스트 처리
      if (status === 'resolved' && report.type === 'user' && report.reportedUserId) {
        await User.update(
          { isBlacklisted: true },
          { where: { id: report.reportedUserId } }
        );
      }

      // 상품 신고인 경우 상품 상태 업데이트
      if (status === 'resolved' && report.type === 'product' && report.reportedProductId) {
        await Product.update(
          { status: 'reported' },
          { where: { id: report.reportedProductId } }
        );
      }

      return report;
    } catch (error) {
      throw new Error('Failed to process report: ' + error.message);
    }
  }
}

module.exports = new ReportService(); 