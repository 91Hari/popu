require('dotenv').config();
const app  = require('./app');
const pool = require('./config/db');

const PORT = parseInt(process.env.PORT || '3000', 10);

pool.query('SELECT 1')
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

process.on('SIGTERM', () => pool.end(() => process.exit(0)));
process.on('SIGINT',  () => pool.end(() => process.exit(0)));
