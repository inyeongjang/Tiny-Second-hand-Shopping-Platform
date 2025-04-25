const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');

// 모든 상품 조회 (인증 불필요)
router.get('/', productController.getProducts);

// 단일 상품 조회 (인증 불필요)
router.get('/:id', productController.getProduct);

// 상품 생성 (인증 필요)
router.post('/', 
  authMiddleware, 
  uploadMiddleware.array('images', 5), // 최대 5개의 이미지 업로드 가능
  productController.createProduct
);

// 상품 수정 (인증 필요)
router.put('/:id', 
  authMiddleware, 
  uploadMiddleware.array('images', 5),
  productController.updateProduct
);

// 상품 삭제 (인증 필요)
router.delete('/:id', 
  authMiddleware, 
  productController.deleteProduct
);

// 상품 상태 업데이트 (인증 필요)
router.patch('/:id/status', 
  authMiddleware, 
  productController.updateProductStatus
);

module.exports = router; 