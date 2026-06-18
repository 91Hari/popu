import { ENV } from './env';

export const USERS = {
  customer: {
    email:    ENV.CUSTOMER_EMAIL,
    password: ENV.CUSTOMER_PASSWORD,
    phone:    ENV.CUSTOMER_PHONE,
    role:     'customer' as const,
  },
  caterer: {
    email:    ENV.CATERER_EMAIL,
    password: ENV.CATERER_PASSWORD,
    role:     'caterer' as const,
  },
  rider: {
    email:    ENV.RIDER_EMAIL,
    password: ENV.RIDER_PASSWORD,
    role:     'rider' as const,
  },
  admin: {
    email:    ENV.ADMIN_EMAIL,
    password: ENV.ADMIN_PASSWORD,
    role:     'admin' as const,
  },
};

export const INVALID_CREDENTIALS = {
  email:    'notexist@popu.test',
  password: 'WrongPassword!',
};

export const SAMPLE_FOOD = {
  name:        'Test Biryani',
  description: 'Playwright test food item',
  price:       '120',
  category:    'Rice',
  serves:      '1',
};

export const SAMPLE_ADDRESS = {
  label:      'Home',
  line1:      '42 Test Street',
  city:       'Hyderabad',
  state:      'Telangana',
  pincode:    '500001',
  lat:        '17.3850',
  lng:        '78.4867',
};

export const ROUTES = {
  landing:   '/',
  login:     '/login',
  register:  '/register',
  forgotPw:  '/forgot-password',
  resetPw:   '/reset-password',

  customer: {
    dashboard:       '/customer',
    search:          '/customer/search',
    profile:         '/customer/profile',
    addresses:       '/customer/profile/addresses',
    paymentMethods:  '/customer/profile/payment-methods',
    settings:        '/customer/profile/settings',
    offers:          '/customer/offers',
    notifications:   '/customer/notifications',
    masterOrders:    '/customer/master-orders',
    tiffinOrders:    '/customer/tiffin-orders',
    cateringBookings:'/customer/catering-bookings',
    cart:            '/cart',
    checkout:        '/checkout/split',
  },

  services: {
    root:        '/services',
    catering:    '/services/catering',
    marketplace: '/services/food-marketplace',
    tiffinBox:   '/services/tiffin-box',
    bookCook:    '/services/book-cook',
    homeFood:    '/services/home-food',
    training:    '/services/training',
  },

  caterer: {
    dashboard:       '/caterer',
    addFood:         '/caterer/add-food',
    foods:           '/caterer/foods',
    availability:    '/caterer/availability',
    notifications:   '/caterer/notifications',
    subOrders:       '/caterer/sub-orders',
    paymentReview:   '/caterer/payment-review',
    catering:        '/caterer/catering',
    cateringBookings:'/caterer/catering-bookings',
    riders:          '/caterer/riders',
    profile:         '/caterer/profile',
    payment:         '/caterer/profile/payment',
    tiffin:          '/caterer/tiffin',
  },

  rider: {
    dashboard: '/rider',
    lookup:    '/rider/lookup',
  },

  admin: {
    dashboard:       '/admin',
    customers:       '/admin/customers',
    caterers:        '/admin/caterers',
    foods:           '/admin/foods',
    orders:          '/admin/orders',
    masterOrders:    '/admin/master-orders',
    riders:          '/admin/riders',
    payments:        '/admin/payments',
    refunds:         '/admin/refunds',
    services:        '/admin/services',
    catering:        '/admin/catering-bookings',
    notifications:   '/admin/notifications',
    reports:         '/admin/reports',
    settings:        '/admin/settings',
    platformSettings:'/admin/platform-settings',
    tiffin:          '/admin/tiffin',
  },
};

export const API_ENDPOINTS = {
  health:          '/health',
  login:           '/api/auth/login',
  register:        '/api/auth/register',
  forgotPassword:  '/api/auth/forgot-password',
  resetPassword:   '/api/auth/reset-password',
  foods:           '/api/foods',
  orders:          '/api/orders',
  customer:        '/api/customer',
  caterers:        '/api/caterers',
  caterersMe:      '/api/caterers/me',
  cart:            '/api/cart',
  search:          '/api/search/suggestions',
  adminDashboard:  '/api/admin/dashboard',
  adminCustomers:  '/api/admin/customers',
  adminCaterers:   '/api/admin/caterers',
  adminOrders:     '/api/admin/orders',
  adminPayments:   '/api/admin/payments',
  adminRiders:     '/api/admin/riders',
  masterOrders:    '/api/master-orders',
  paymentProofs:   '/api/payment-proofs',
  catering:        '/api/catering',
  riders:          '/api/riders',
  riderDeliveries: '/api/riders/deliveries',
  riderLocation:   '/api/riders/location',
  reviews:         '/api/reviews',
  payments:        '/api/payments',
  profile:         '/api/profile',
  tiffin:          '/api/tiffin',
  checkout:        '/api/checkout',
};
