'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 테이블에 receiverId 컬럼 추가 (NULL 허용으로 변경)
    await queryInterface.addColumn('chats', 'receiverId', {
      type: Sequelize.INTEGER,
      allowNull: true, // 기존 데이터 때문에 일단 NULL 허용
      references: {
        model: 'users',
        key: 'id'
      }
    });

    // 기존 데이터가 있는 경우 채팅방 생성 규칙에 따라 updateAt 설정
    try {
      // 실행 중인 데이터베이스의 쿼리 엔진에 따라 다른 쿼리 사용
      await queryInterface.sequelize.query(`
        UPDATE chats 
        SET receiverId = (
          SELECT id FROM users 
          WHERE id != senderId 
          ORDER BY RAND() 
          LIMIT 1
        ) 
        WHERE receiverId IS NULL;
      `);

      // 받는 사람 ID가 설정된 후 NOT NULL 제약조건을 적용
      await queryInterface.changeColumn('chats', 'receiverId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      });
    } catch (error) {
      console.error('기존 채팅 데이터 처리 중 오류 발생:', error);
      // 오류가 발생해도 마이그레이션은 진행
    }
  },

  async down(queryInterface, Sequelize) {
    // 롤백 시 컬럼 제거
    await queryInterface.removeColumn('chats', 'receiverId');
  }
};
