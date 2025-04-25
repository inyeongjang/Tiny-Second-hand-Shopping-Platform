const { sequelize } = require('../models');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // 모든 테이블 목록 조회
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('\nDatabase Tables:');
    const tables = results.map(row => Object.values(row)[0]);
    tables.forEach(table => {
      console.log(`- ${table}`);
    });

    // 각 테이블의 구조 조회
    for (const table of tables) {
      console.log(`\nStructure of ${table}:`);
      const [columns] = await sequelize.query(`DESCRIBE ${table}`);
      console.log(columns);
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection(); 