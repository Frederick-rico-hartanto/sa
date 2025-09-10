// Use dotenv to load variables from your .env file
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create ONE Sequelize instance using the credentials from your .env file
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Set to console.log to see the generated SQL queries
    timezone: '+07:00', // Jakarta timezone
  }
);

// Export this single, configured instance
module.exports = sequelize;