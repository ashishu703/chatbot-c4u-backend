require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  process.env.DBPASS,
  {
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    dialect: "postgres",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ PostgreSQL connected via Sequelize"))
  .catch((err) => console.error("❌ Connection error:", err));

module.exports = sequelize;
