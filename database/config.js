require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    max: 1000,
    host: process.env.DBHOST || "localhost",
    port: process.env.DBPORT || 5432,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error({
            err: err,
            msg: "Database connection error"
        });
    } else {
        console.log("Database has been connected");
        release(); // release the client back to the pool
    }
});

module.exports = pool;
