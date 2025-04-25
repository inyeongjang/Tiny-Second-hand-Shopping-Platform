'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        name: '디지털기기',
        description: '스마트폰, 노트북, 태블릿 등 디지털 기기',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '생활가전',
        description: 'TV, 냉장고, 세탁기 등 생활 가전제품',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '가구/인테리어',
        description: '침대, 소파, 책상 등 가구 및 인테리어 제품',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '의류',
        description: '남성/여성 의류, 신발, 액세서리',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '스포츠/레저',
        description: '스포츠 용품, 캠핑용품, 자전거 등',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
}; 