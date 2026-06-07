# POPU - Food Catering Platform

## Project Overview

POPU is a full-stack web application for connecting food caterers with customers. Users can browse food items, place orders, and manage their accounts based on their role (customer or caterer).

---

## Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Port:** 3000
- **Key Libraries:**
  - `jsonwebtoken` - JWT-based authentication
  - `cors` - Cross-origin resource sharing
  - `express.json()` - JSON body parsing

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Port:** 5173
- **Router:** React Router DOM v7
- **Key Libraries:**
  - `axios` - HTTP client
  - `@tanstack/react-query` - Data fetching & caching
  - `@mui/material` - UI components

---

## Project Structure

```
popu/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── foodController.js
│   │   ├── middlewares/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── foods.js
│   │   │   └── index.js
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── FoodCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── customer/
│   │   │   │   ├── CustomerDashboard.jsx
│   │   │   │   ├── FoodSearchPage.jsx
│   │   │   │   ├── FoodDetailsPage.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   └── OrdersPage.jsx
│   │   │   └── caterer/
│   │   │       ├── CatererDashboard.jsx
│   │   │       ├── AddFoodPage.jsx
│   │   │       ├── FoodListPage.jsx
│   │   │       └── CatererOrdersPage.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── foodService.js
│   │   │   └── orderService.js
│   │   ├── theme/
│   │   │   └── theme.js
│   │   ├── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── node_modules/
├── database/
│   └── schema.sql
└── README.md
```

---

## Running the Application

### Start Backend

```bash
cd backend
npm install
node src/server.js
# Server runs on http://localhost:3000
```

### Start Frontend

```bash
cd frontend
npm install
npm run build    # or: npx vite (dev server)
# Dev server runs on http://localhost:5173
```

---

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new customer account

### Foods

- `GET /api/foods` - List all available foods
- `GET /api/foods/:id` - Get specific food by ID

---

## Test Credentials

### Customer Account

- Email: `customer@test.com`
- Password: `password123`
- Role: `customer`

### Caterer Account

- Email: `caterer@test.com`
- Password: `password123`
- Role: `caterer`

---

## Features Implemented

### Backend

✅ Express.js REST API  
✅ JWT-based authentication  
✅ CORS enabled for frontend communication  
✅ Mock food data controller  
✅ Auth controller with login/register  
✅ Proper error handling

### Frontend

✅ React Router for navigation  
✅ Vite build tool with HMR  
✅ Login/Register pages  
✅ Customer pages (Dashboard, Search, Cart, Orders)  
✅ Caterer pages (Dashboard, Add Food, List, Orders)  
✅ API service layer  
✅ Global CSS styling  
✅ Responsive component structure

---

## Authentication Flow

1. User enters email/password on login page
2. Frontend sends `POST /api/auth/login` to backend
3. Backend validates credentials and returns JWT token
4. Frontend stores token in `localStorage`
5. Token included in `Authorization: Bearer <token>` header for protected API calls
6. User redirected to dashboard after successful login

---

## Recent Changes

**Commit:** `fix: add CORS middleware, improve login page UX, remove auth redirect loops`

- Added CORS middleware to backend to allow cross-origin requests
- Removed redirect loops by removing `ProtectedRoute` wrappers
- Enhanced login page with error messages, loading state, and demo credentials
- Fixed routing to allow login page access without authentication
- All pages now accessible (auth checks can be added per page as needed)

---

## Next Steps (Optional)

1. **Database Integration**: Connect to PostgreSQL for persistent data
2. **Advanced Auth**: Add role-based access control (RBAC)
3. **Order Management**: Implement complete order flow
4. **Real-time Updates**: Add WebSocket for live notifications
5. **Payment Integration**: Add payment gateway (Stripe/Razorpay)
6. **UI Improvements**: Implement Material-UI components
7. **Testing**: Add unit and integration tests
8. **Deployment**: Deploy to cloud (AWS/Heroku/Vercel)

---

## Development Notes

- Backend uses CommonJS modules (`require`)
- Frontend uses ES modules (JSX/import)
- API base URL configurable via `VITE_API_URL` env var (defaults to `http://localhost:3000/api`)
- Mock user data stored in-memory (resets on server restart)
- JWT secret stored in auth controller (change in production)

---

## Troubleshooting

**Blank Screen:**

- Ensure both backend and frontend are running
- Check browser console for errors (F12)
- Verify port 5173 and 3000 are accessible

**Login Fails:**

- Ensure backend is running on port 3000
- Check CORS is enabled in `backend/src/app.js`
- Verify credentials: `customer@test.com` / `password123`

**API Not Responding:**

- Check backend console for errors
- Verify `http://localhost:3000/api/foods` returns data with curl
- Check network tab in browser DevTools

---

## Contact & Support

For issues or questions, check the commit history or browser console for detailed error messages.
