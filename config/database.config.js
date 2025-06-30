require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    host: process.env.HOST,
    dialect: "postgres",
    logging: false,
    schema: process.env.SCHEMA
  },
  test: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    host: process.env.HOST,
    dialect: "postgres",
    logging: false,
    schema: process.env.SCHEMA
  },
  production: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    host: process.env.HOST,
    dialect: "postgres",
    logging: false,
    schema: process.env.SCHEMA
  },
};
