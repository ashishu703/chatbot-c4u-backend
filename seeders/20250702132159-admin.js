'use strict';
const { encryptPassword, generateUid } = require("../utils/auth.utils");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await encryptPassword("admin");

    return queryInterface.bulkInsert('admins', [{
      name: 'MBG Admin',
      email: "admin@mbg.com",
      uid: generateUid(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('admins', {
      email: "admin@mbg.com"
    }, {});
  }
};
