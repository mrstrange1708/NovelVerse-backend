require("dotenv").config();


const db = {
  url: process.env.DATABASE_URL,
};

module.exports = db;