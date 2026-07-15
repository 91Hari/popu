require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const pool    = require('./config/db');

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
const paymentRoutes              = require('./routes/paymentRoutes');
const webhookRoutes              = require('./routes/webhookRoutes');
const profileRoutes              = require('./routes/profileRoutes');
const tiffinRoutes               = require('./routes/tiffinRoutes');
const deliveryRoutes             = require('./routes/deliveryRoutes');
const pickupRoutes               = require('./routes/pickupRoutes');
const razorpayRoutes             = require('./routes/razorpayRoutes');

const app = express();

// Trust proxy chain (required on Render — uses multiple load balancer hops)
// Allows express-rate-limit to read real client IP from X-Forwarded-For
app.set('trust proxy', true);

app.use(helmet());
// Support comma-separated origins in CORS_ORIGIN env var.
// Entries may contain * as a wildcard, e.g. https://*.vercel.app
// Paths/hashes in entries are stripped — CORS origins are scheme+host+port only.
const _corsMatchers = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((entry) => {
      // Strip any accidental path/hash/query — origin is scheme+host+port
      let o = entry.trim();
      try { o = new URL(o).origin; } catch { /* keep as-is if not a valid URL */ }

      if (o.includes('*')) {
        // Convert glob wildcard to regex: escape regex chars, then * → .*
        const pattern = o
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`);
      }
      return o; // exact string match
    })
  : null;

app.use(cors({
  origin: _corsMatchers
    ? (origin, cb) => {
        // Allow requests with no origin (mobile apps, curl, Render health checks)
        if (!origin) return cb(null, true);
        const allowed = _corsMatchers.some((m) =>
          typeof m === 'string' ? m === origin : m.test(origin)
        );
        if (allowed) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic health ping (always available)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Maintenance mode middleware ──────────────────────────────────────────────
// Set MAINTENANCE_MODE=true in env to enable. All /api/* routes return 503
// EXCEPT /api/health and /api/health/status which always pass through.
if (process.env.MAINTENANCE_MODE === 'true') {
  app.use('/api', (req, res, next) => {
    if (req.path === '/health' || req.path === '/health/status') return next();
    return res.status(503).json({
      maintenance: true,
      message: "We're upgrading PO.PU — we'll be back shortly.",
    });
  });
}

// ── Detailed health status endpoint ─────────────────────────────────────────
app.get('/api/health/status', async (req, res) => {
  const checks = {
    database: 'unknown',
    email:    'unknown',
    payment:  'unknown',
    maps:     'unknown',
  };

  // Database
  try {
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch (e) {
    checks.database = 'error';
  }

  // Email — check if SMTP env vars are configured
  checks.email = process.env.SMTP_HOST ? 'ok' : 'not_configured';

  // Payment — check if PhonePe credentials are set
  checks.payment = process.env.PHONEPE_CLIENT_ID ? 'ok' : 'not_configured';

  // Google Maps
  checks.maps = process.env.GOOGLE_MAPS_API_KEY ? 'ok' : 'not_configured';

  const allOk = Object.values(checks).every(
    (v) => v === 'ok' || v === 'not_configured'
  );

  return res.status(allOk ? 200 : 207).json({
    status:    allOk ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version:   process.env.npm_package_version || '1.0.0',
  });
});

// ── Application routes ───────────────────────────────────────────────────────
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
app.use('/api/payments',               paymentRoutes);
app.use('/api/webhooks',               webhookRoutes);
app.use('/api/profile',                profileRoutes);
app.use('/api/tiffin',                 tiffinRoutes);
app.use('/api/delivery',               deliveryRoutes);
app.use('/api/pickup',                 pickupRoutes);
app.use('/api/razorpay',              razorpayRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
