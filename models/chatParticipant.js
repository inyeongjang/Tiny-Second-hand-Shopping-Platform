'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ChatParticipant extends Model {
    static associate(models) {
      ChatParticipant.belongsTo(models.Chat, {
        foreignKey: 'chatId',
        as: 'chat'
      });
      
      ChatParticipant.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  ChatParticipant.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lastReadAt: {
      type: DataTypes.DATE,
      allowNull: true
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
    modelName: 'ChatParticipant',
    tableName: 'chat_participants',
    timestamps: true
  });

  return ChatParticipant;
}; 