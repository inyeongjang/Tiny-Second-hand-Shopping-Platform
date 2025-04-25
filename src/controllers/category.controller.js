const categoryService = require('../services/category.service');

class CategoryController {
  // 카테고리 생성
  async createCategory(req, res) {
    try {
      const categoryData = req.body;
      const category = await categoryService.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 카테고리 조회 (단일)
  async getCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      res.json(category);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // 모든 카테고리 조회
  async getCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 카테고리 수정
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const category = await categoryService.updateCategory(id, updateData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 카테고리 삭제
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.deleteCategory(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CategoryController(); 