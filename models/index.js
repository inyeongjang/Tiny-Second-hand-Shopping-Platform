'use strict';

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'second_hand_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true  // 테이블 이름의 자동 복수형 변환만 비활성화
    }
  }
);

const db = {};

// 현재 디렉토리의 모든 모델 파일을 가져옵니다
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// 모델 간의 관계 설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
