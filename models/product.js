'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      
      Product.belongsTo(models.User, {
        foreignKey: 'sellerId',
        as: 'seller'
      });
      
      Product.belongsTo(models.User, {
        foreignKey: 'buyerId',
        as: 'buyer'
      });
      
      Product.hasMany(models.Report, {
        foreignKey: 'productId',
        as: 'reports'
      });
      
      Product.hasOne(models.Transaction, {
        foreignKey: 'productId',
        as: 'transaction'
      });
    }
  }

  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'sold'),
      defaultValue: 'available'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true
  });

  return Product;
}; 