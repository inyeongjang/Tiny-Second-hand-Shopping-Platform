'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Report extends Model {
    static associate(models) {
      Report.belongsTo(models.User, {
        foreignKey: 'reporterId',
        as: 'reporter'
      });
      
      Report.belongsTo(models.User, {
        foreignKey: 'reportedUserId',
        as: 'reportedUser'
      });
      
      Report.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }

  Report.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reportedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
      defaultValue: 'pending'
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
    modelName: 'Report',
    tableName: 'reports',
    timestamps: true
  });

  return Report;
}; 