const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// 상품 검색
router.get('/products', searchController.searchProducts);

// 카테고리 검색
router.get('/categories', searchController.searchCategories);

module.exports = router; 