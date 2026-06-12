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
const checkoutRoutes             = require('./routes/checkoutRoutes');
const masterOrderRoutes          = require('./routes/masterOrderRoutes');
const catererOrderRoutes         = require('./routes/catererOrderRoutes');
const paymentProofRoutes         = require('./routes/paymentProofRoutes');
const cateringRoutes             = require('./routes/cateringRoutes');
const riderRoutes                = require('./routes/riderRoutes');
const reviewRoutes               = require('./routes/reviewRoutes');

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
app.use('/api/checkout',               checkoutRoutes);
app.use('/api/master-orders',          masterOrderRoutes);
app.use('/api/caterer-orders',         catererOrderRoutes);
app.use('/api/payment-proofs',         paymentProofRoutes);
app.use('/api/catering',               cateringRoutes);
app.use('/api/riders',                 riderRoutes);
app.use('/api/reviews',                reviewRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
