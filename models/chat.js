'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender'
      });
      
      Chat.belongsTo(models.User, {
        foreignKey: 'receiverId',
        as: 'receiver'
      });
      
      // Product와의 관계 제거 - 실제 DB 컬럼이 없으므로 가상 관계만 유지
      // 가상 필드로 처리하고 실제 쿼리에는 포함시키지 않음
      
      Chat.hasMany(models.Message, {
        foreignKey: 'chatId',
        as: 'messages'
      });
      
      Chat.hasMany(models.ChatParticipant, {
        foreignKey: 'chatId',
        as: 'participants'
      });
    }
  }

  // 기본 필드 정의 - 필수 필드만 포함
  const fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '새로운 대화가 시작되었습니다.'
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
  };

  // 모델 초기화
  Chat.init(fields, {
    sequelize,
    modelName: 'Chat',
    tableName: 'chats',
    timestamps: true
  });

  return Chat;
}; 