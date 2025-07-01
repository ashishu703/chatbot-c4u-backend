require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    host: process.env.DBHOST,
    dialect: process.env.DIALECT,
    logging: false,
    schema: process.env.SCHEMA
  },
  test: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    host: process.env.DBHOST,
    dialect: process.env.DIALECT,
    logging: false,
    schema: process.env.SCHEMA
  },
  production: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    host: process.env.DBHOST,
    dialect: process.env.DIALECT,
    logging: false,
    schema: process.env.SCHEMA
  },
};
