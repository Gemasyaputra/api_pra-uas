const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: 3306,
    logging: false,
  }
);

const connectWithRetry = async (retries = 5, delay = 3000) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      retries -= 1;
      console.error(`❌ DB connection failed. Retries left: ${retries}`);
      console.error(error.message);

      if (!retries) {
        console.error('🚨 Could not connect to database. Exiting...');
        process.exit(1);
      }

      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// WAJIB dipanggil
connectWithRetry();

module.exports = sequelize;
