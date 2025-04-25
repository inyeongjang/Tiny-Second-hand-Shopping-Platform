'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Products
      User.hasMany(models.Product, { 
        foreignKey: 'sellerId',
        as: 'sellingProducts'
      });
      User.hasMany(models.Product, { 
        foreignKey: 'buyerId',
        as: 'boughtProducts'
      });

      // Chats
      User.hasMany(models.Chat, { 
        foreignKey: 'senderId',
        as: 'sentChats'
      });
      User.hasMany(models.Chat, { 
        foreignKey: 'receiverId',
        as: 'receivedChats'
      });

      // Messages
      User.hasMany(models.Message, { 
        foreignKey: 'senderId',
        as: 'sentMessages'
      });

      // Chat Participants
      User.hasMany(models.ChatParticipant, { 
        foreignKey: 'userId',
        as: 'chatParticipants'
      });

      // Reports
      User.hasMany(models.Report, { 
        foreignKey: 'reporterId',
        as: 'reportedIssues'
      });
      User.hasMany(models.Report, { 
        foreignKey: 'reportedUserId',
        as: 'receivedReports'
      });

      // Transactions
      User.hasMany(models.Transaction, { 
        foreignKey: 'buyerId',
        as: 'buyerTransactions'
      });
      User.hasMany(models.Transaction, { 
        foreignKey: 'sellerId',
        as: 'sellerTransactions'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true
  });

  return User;
}; 