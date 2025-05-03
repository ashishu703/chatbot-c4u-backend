const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DBNAME,
  password: process.env.DBPASS,
  port: process.env.DBPORT,
});

// Debug function to log queries
async function query(text, params) {
  console.log('Executing query:', { text, params });
  try {
    const res = await pool.query(text, params);
    console.log('Query result:', res.rows);
    return res.rows; // Return only rows for simpler usage
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

module.exports = {
  query,
  pool,
};