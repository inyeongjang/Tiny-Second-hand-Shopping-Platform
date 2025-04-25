const productService = require('../services/product.service');
const uploadMiddleware = require('../middlewares/upload.middleware');

class ProductController {
  // 상품 생성
  async createProduct(req, res) {
    try {
      const productData = req.body;
      const sellerId = req.user.id;
      const product = await productService.createProduct(productData, sellerId);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 상품 조회 (단일)
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // 상품 목록 조회
  async getProducts(req, res) {
    try {
      const filters = req.query;
      const result = await productService.getProducts(filters);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 상품 수정
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const product = await productService.updateProduct(id, updateData, userId);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 상품 삭제
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = await productService.deleteProduct(id, userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 상품 상태 업데이트
  async updateProductStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      const product = await productService.updateProductStatus(id, status, userId);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ProductController(); 