'use strict';
const bcrypt = require('bcrypt');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await queryInterface.bulkInsert('users', [{
            email: 'admin@example.com',
            password: hashedPassword,
            nickname: 'Admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
    }
};