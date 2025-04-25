const { Product, Category, User } = require('../../models');
const { Op } = require('sequelize');

class SearchService {
  // 상품 검색
  async searchProducts(filters = {}) {
    try {
      const {
        keyword,
        categoryId,
        minPrice,
        maxPrice,
        location,
        status,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        page = 1,
        limit = 10
      } = filters;

      // 검색 조건 설정
      const where = {};
      
      // 키워드 검색 (제목, 설명)
      if (keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 카테고리 필터링
      if (categoryId) {
        where.categoryId = categoryId;
      }

      // 가격 범위 필터링
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = minPrice;
        if (maxPrice) where.price[Op.lte] = maxPrice;
      }

      // 지역 필터링
      if (location) {
        where.location = { [Op.like]: `%${location}%` };
      }

      // 상태 필터링
      if (status) {
        where.status = status;
      }

      // 정렬 옵션
      const order = [[sortBy, sortOrder]];

      // 페이지네이션
      const offset = (page - 1) * limit;

      // 상품 검색
      const { count, rows: products } = await Product.findAndCountAll({
        where,
        include: [
          { model: Category, as: 'category' },
          { model: User, as: 'seller' }
        ],
        order,
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
      throw new Error('Failed to search products: ' + error.message);
    }
  }

  // 카테고리 검색
  async searchCategories(keyword) {
    try {
      const categories = await Category.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${keyword}%` } },
            { description: { [Op.like]: `%${keyword}%` } }
          ]
        },
        include: [
          { model: Category, as: 'parent' },
          { model: Category, as: 'children' }
        ]
      });

      return categories;
    } catch (error) {
      throw new Error('Failed to search categories: ' + error.message);
    }
  }
}

module.exports = new SearchService(); 