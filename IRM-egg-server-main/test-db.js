// test-db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('internship_application', 'root', 'Roshan12345', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful.');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();

