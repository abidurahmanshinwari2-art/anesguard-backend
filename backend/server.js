const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./src/config/db');
const app = require('./src/app');

const start = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
  });
};

start();
