'use strict';

/**
 * Payment provider registry.
 * Select active provider via PAYMENT_PROVIDER env var.
 * Defaults to manual_upi (current MVP flow).
 */

const PROVIDERS = {
  manual:    () => require('./manualUpiProvider'),
  manual_upi: () => require('./manualUpiProvider'),
  phonepe:   () => require('./phonepeProvider'),
  razorpay:  () => require('./razorpayProvider'),
  cashfree:  () => require('./cashfreeProvider'),
};

const key = (process.env.PAYMENT_PROVIDER || 'manual').toLowerCase();
const factory = PROVIDERS[key];

if (!factory) {
  throw new Error(
    `Unknown PAYMENT_PROVIDER="${key}". Valid values: ${Object.keys(PROVIDERS).join(', ')}`
  );
}

module.exports = factory();
