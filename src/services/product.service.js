const { Product, Category, User } = require('../../models');

class ProductService {
  // 상품 생성
  async createProduct(productData, sellerId) {
    try {
      const product = await Product.create({
        ...productData,
        sellerId,
        status: 'available'
      });
      return product;
    } catch (error) {
      throw new Error('Failed to create product: ' + error.message);
    }
  }

  // 상품 조회 (단일)
  async getProductById(id) {
    try {
      const product = await Product.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: User, as: 'seller' },
          { model: User, as: 'buyer' }
        ]
      });
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      throw new Error('Failed to get product: ' + error.message);
    }
  }

  // 상품 목록 조회
  async getProducts(filters = {}) {
    try {
      const { categoryId, status, sellerId, buyerId, page = 1, limit = 10 } = filters;
      
      const where = {};
      if (categoryId) where.categoryId = categoryId;
      if (status) where.status = status;
      if (sellerId) where.sellerId = sellerId;
      if (buyerId) where.buyerId = buyerId;

      const products = await Product.findAndCountAll({
        where,
        include: [
          { model: Category, as: 'category' },
          { model: User, as: 'seller' }
        ],
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });

      return {
        products: products.rows,
        total: products.count,
        page,
        totalPages: Math.ceil(products.count / limit)
      };
    } catch (error) {
      throw new Error('Failed to get products: ' + error.message);
    }
  }

  // 상품 수정
  async updateProduct(id, updateData, userId) {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.sellerId !== userId) {
        throw new Error('Not authorized to update this product');
      }

      await product.update(updateData);
      return product;
    } catch (error) {
      throw new Error('Failed to update product: ' + error.message);
    }
  }

  // 상품 삭제
  async deleteProduct(id, userId) {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.sellerId !== userId) {
        throw new Error('Not authorized to delete this product');
      }

      await product.destroy();
      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete product: ' + error.message);
    }
  }

  // 상품 상태 업데이트
  async updateProductStatus(id, status, userId) {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.sellerId !== userId) {
        throw new Error('Not authorized to update this product');
      }

      await product.update({ status });
      return product;
    } catch (error) {
      throw new Error('Failed to update product status: ' + error.message);
    }
  }
}

module.exports = new ProductService(); 