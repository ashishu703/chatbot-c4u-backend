"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing unique constraint on catalog_id if it exists
    try {
      // Try to drop the old global unique constraint on catalog_id
      await queryInterface.sequelize.query(
        `DROP INDEX IF EXISTS catalogs_catalog_id_key;`
      );
    } catch (error) {
      console.log("Old unique constraint might not exist, continuing...");
    }

    // Check if the composite unique index already exists before creating it
    const [results] = await queryInterface.sequelize.query(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'catalogs' AND indexname = 'catalogs_uid_catalog_id_unique';`
    );

    if (results.length === 0) {
      // Add composite unique constraint on (uid, catalog_id) only if it doesn't exist
      await queryInterface.addIndex("catalogs", ["uid", "catalog_id"], {
        unique: true,
        name: "catalogs_uid_catalog_id_unique",
      });
      console.log("Created composite unique index catalogs_uid_catalog_id_unique");
    } else {
      console.log("Index catalogs_uid_catalog_id_unique already exists, skipping...");
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex("catalogs", "catalogs_uid_catalog_id_unique");
    } catch (error) {
      console.log("Index might not exist, continuing...");
    }
  },
};
