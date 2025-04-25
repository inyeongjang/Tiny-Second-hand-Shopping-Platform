'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Chat, {
        foreignKey: 'chatId',
        as: 'chat'
      });
      
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender'
      });
      
      Message.belongsTo(models.User, {
        foreignKey: 'receiverId',
        as: 'receiver'
      });
    }
  }

  Message.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true
  });

  return Message;
}; 