require('dotenv').config();
const app                 = require('./app');
const pool                = require('./config/db');
const escalationScheduler = require('./services/orderEscalationScheduler');
const deliveryScheduler   = require('./services/deliveryScheduler');

const PORT = parseInt(process.env.PORT || '3000', 10);

pool.query('SELECT 1')
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      escalationScheduler.start();
      deliveryScheduler.start();
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

process.on('SIGTERM', () => pool.end(() => process.exit(0)));
process.on('SIGINT',  () => pool.end(() => process.exit(0)));
