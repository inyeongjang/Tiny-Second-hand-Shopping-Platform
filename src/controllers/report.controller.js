const reportService = require('../services/report.service');

class ReportController {
  // 신고 생성
  async createReport(req, res) {
    try {
      const reportData = {
        ...req.body,
        reporterId: req.user.id
      };

      const report = await reportService.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 상품 신고 생성
  async createProductReport(req, res) {
    try {
      const { productId, reason } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: '상품 ID가 필요합니다.' });
      }
      
      if (!reason) {
        return res.status(400).json({ error: '신고 사유가 필요합니다.' });
      }
      
      // 상품 정보 조회하여 판매자 ID 가져오기
      const { Product } = require('../../models');
      let product;
      
      try {
        product = await Product.findByPk(productId);
        if (!product) {
          return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        }
      } catch (err) {
        console.error('상품 조회 오류:', err);
        return res.status(500).json({ error: '상품 정보 조회 중 오류가 발생했습니다.' });
      }
      
      const reportData = {
        reporterId: req.user.id,
        reportedUserId: product.sellerId || req.user.id, // 판매자 ID 사용, 없으면 신고자 ID로 대체
        productId,
        reason,
        status: 'pending'
      };
      
      console.log('생성할 신고 데이터:', reportData);

      const report = await reportService.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      console.error('상품 신고 생성 오류:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // 사용자 신고 생성
  async createUserReport(req, res) {
    try {
      const { reportedUserId, reason } = req.body;
      
      if (!reportedUserId) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
      }
      
      if (!reason) {
        return res.status(400).json({ error: '신고 사유가 필요합니다.' });
      }
      
      // 자기 자신을 신고하는 경우 방지
      if (reportedUserId == req.user.id) {
        return res.status(400).json({ error: '자기 자신을 신고할 수 없습니다.' });
      }
      
      const reportData = {
        reporterId: req.user.id,
        reportedUserId,
        reason,
        status: 'pending'
      };

      const report = await reportService.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      console.error('사용자 신고 생성 오류:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // 신고 목록 조회 (관리자용)
  async getReports(req, res) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await reportService.getReports(filters);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 신고 상세 조회
  async getReport(req, res) {
    try {
      const { id } = req.params;
      const report = await reportService.getReportById(id);
      res.json(report);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // 신고 처리 (관리자용)
  async processReport(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      const adminId = req.user.id;

      const report = await reportService.processReport(id, adminId, status, adminNote);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ReportController(); 