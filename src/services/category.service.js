const { Category, Product } = require('../../models');

class CategoryService {
  // 카테고리 생성
  async createCategory(categoryData) {
    try {
      const category = await Category.create(categoryData);
      return category;
    } catch (error) {
      throw new Error('Failed to create category: ' + error.message);
    }
  }

  // 카테고리 조회 (단일)
  async getCategoryById(id) {
    try {
      const category = await Category.findByPk(id, {
        include: [
          { model: Category, as: 'parent' },
          { model: Category, as: 'children' },
          { model: Product, as: 'products' }
        ]
      });
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      throw new Error('Failed to get category: ' + error.message);
    }
  }

  // 모든 카테고리 조회
  async getAllCategories() {
    try {
      const categories = await Category.findAll({
        include: [
          { model: Category, as: 'parent' },
          { model: Category, as: 'children' }
        ],
        order: [['name', 'ASC']]
      });
      return categories;
    } catch (error) {
      throw new Error('Failed to get categories: ' + error.message);
    }
  }

  // 카테고리 수정
  async updateCategory(id, updateData) {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        throw new Error('Category not found');
      }

      await category.update(updateData);
      return category;
    } catch (error) {
      throw new Error('Failed to update category: ' + error.message);
    }
  }

  // 카테고리 삭제
  async deleteCategory(id) {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        throw new Error('Category not found');
      }

      // 하위 카테고리가 있는지 확인
      const hasChildren = await Category.count({ where: { parentId: id } });
      if (hasChildren > 0) {
        throw new Error('Cannot delete category with children');
      }

      // 카테고리에 속한 상품이 있는지 확인
      const hasProducts = await Product.count({ where: { categoryId: id } });
      if (hasProducts > 0) {
        throw new Error('Cannot delete category with products');
      }

      await category.destroy();
      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete category: ' + error.message);
    }
  }
}

module.exports = new CategoryService(); 