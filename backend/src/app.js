require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const authRoutes                 = require('./routes/authRoutes');
const foodRoutes                 = require('./routes/foodRoutes');
const orderRoutes                = require('./routes/orderRoutes');
const customerFoodRoutes         = require('./routes/customerFoodRoutes');
const catererRoutes              = require('./routes/catererRoutes');
const cartRoutes                 = require('./routes/cartRoutes');
const searchRoutes               = require('./routes/searchRoutes');
const adminRoutes                = require('./routes/adminRoutes');
const catererNotificationRoutes  = require('./routes/catererNotificationRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin:  process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',                   authRoutes);
app.use('/api/foods',                  foodRoutes);
app.use('/api/orders',                 orderRoutes);
app.use('/api/customer',               customerFoodRoutes);
app.use('/api/caterers',               catererRoutes);
app.use('/api/cart',                   cartRoutes);
app.use('/api/search',                 searchRoutes);
app.use('/api/admin',                  adminRoutes);
app.use('/api/caterer/notifications',  catererNotificationRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
