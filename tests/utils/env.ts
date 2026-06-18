/** Central environment config — override via process.env or .env.test */
export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://popu-git-haridev-91haris-projects.vercel.app',
  API_URL:  process.env.API_URL  || 'https://popu-backend.onrender.com',

  // Test account credentials — set in CI secrets or .env.test
  CUSTOMER_EMAIL:    process.env.TEST_CUSTOMER_EMAIL    || 'testcustomer@popu.test',
  CUSTOMER_PASSWORD: process.env.TEST_CUSTOMER_PASSWORD || 'Test@1234',
  CUSTOMER_PHONE:    process.env.TEST_CUSTOMER_PHONE    || '9999999901',

  CATERER_EMAIL:    process.env.TEST_CATERER_EMAIL    || 'testcaterer@popu.test',
  CATERER_PASSWORD: process.env.TEST_CATERER_PASSWORD || 'Test@1234',

  RIDER_EMAIL:    process.env.TEST_RIDER_EMAIL    || 'testrider@popu.test',
  RIDER_PASSWORD: process.env.TEST_RIDER_PASSWORD || 'Test@1234',

  ADMIN_EMAIL:    process.env.TEST_ADMIN_EMAIL    || 'admin@popu.com',
  ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD || 'Admin@123',

  GOOGLE_MAPS_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY || '',
};
