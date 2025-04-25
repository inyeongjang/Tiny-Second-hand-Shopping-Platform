const searchService = require('../services/search.service');

class SearchController {
  // 상품 검색
  async searchProducts(req, res) {
    try {
      const filters = {
        keyword: req.query.keyword,
        categoryId: req.query.categoryId,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        location: req.query.location,
        status: req.query.status,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await searchService.searchProducts(filters);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 카테고리 검색
  async searchCategories(req, res) {
    try {
      const { keyword } = req.query;
      const categories = await searchService.searchCategories(keyword);
      res.json(categories);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new SearchController(); 