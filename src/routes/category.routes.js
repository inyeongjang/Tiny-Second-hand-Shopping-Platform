const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 모든 카테고리 조회 (인증 불필요)
router.get('/', categoryController.getCategories);

// 단일 카테고리 조회 (인증 불필요)
router.get('/:id', categoryController.getCategory);

// 카테고리 생성 (인증 필요)
router.post('/', 
  authMiddleware, 
  categoryController.createCategory
);

// 카테고리 수정 (인증 필요)
router.put('/:id', 
  authMiddleware, 
  categoryController.updateCategory
);

// 카테고리 삭제 (인증 필요)
router.delete('/:id', 
  authMiddleware, 
  categoryController.deleteCategory
);

module.exports = router; 