require("dotenv").config();
const { Sequelize } = require("sequelize");
const { Pool } = require("pg");

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
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    console.log('Executing query:', { text, params }); 
    const res = await client.query(text, params);
    console.log('Query result:', res.rows); 
    return res.rows;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  } finally {
    client.release();
  }
};
const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DBNAME,
  password: process.env.DBPASS,
  port: process.env.DBPORT,
});


sequelize
  .authenticate()
  .then(() => console.log("✅ PostgreSQL connected via Sequelize"))
  .catch((err) => console.error("❌ Connection error:", err));

module.exports = {sequelize, query, pool};
