import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const LoginPage          = React.lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage       = React.lazy(() => import("../pages/auth/RegisterPage"));
const CustomerDashboard  = React.lazy(() => import("../pages/customer/CustomerDashboard"));
const SearchPage         = React.lazy(() => import("../pages/customer/SearchPage"));
const FoodDetailsPage    = React.lazy(() => import("../pages/customer/FoodDetailsPage"));
const ProfilePage        = React.lazy(() => import("../pages/customer/ProfilePage"));
const OffersPage         = React.lazy(() => import("../pages/customer/OffersPage"));
const CustomerOrdersPage = React.lazy(() => import("../pages/customer/OrdersPage"));
const NotificationsPage  = React.lazy(() => import("../pages/customer/NotificationsPage"));
const CartPage           = React.lazy(() => import("../pages/customer/CartPage"));

const ServicesPage       = React.lazy(() => import("../pages/services/ServicesPage"));
const CateringPage       = React.lazy(() => import("../pages/services/CateringPage"));
const CatererDetailPage  = React.lazy(() => import("../pages/services/CatererDetailPage"));
const TiffinsPage        = React.lazy(() => import("../pages/services/TiffinsPage"));
const BookCookPage       = React.lazy(() => import("../pages/services/BookCookPage"));
const HomeFoodPage       = React.lazy(() => import("../pages/services/HomeFoodPage"));
const TrainingPage       = React.lazy(() => import("../pages/services/TrainingPage"));

const CatererDashboard  = React.lazy(() => import("../pages/caterer/CatererDashboard"));
const AddFoodPage       = React.lazy(() => import("../pages/caterer/AddFoodPage"));
const FoodListPage      = React.lazy(() => import("../pages/caterer/FoodListPage"));
const CatererOrdersPage = React.lazy(() => import("../pages/caterer/CatererOrdersPage"));

function isAuthenticated() {
  try { return !!localStorage.getItem("token"); } catch { return false; }
}
function getUserRole() {
  try { const u = JSON.parse(localStorage.getItem("user")); return u?.role || null; } catch { return null; }
}

function RequireAuth({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ allowed = [], children }) {
  const role = getUserRole();
  if (!role || !allowed.includes(role)) {
    if (isAuthenticated()) return <Navigate to={role === "caterer" ? "/caterer" : "/customer"} replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function C({ allowed, element }) {
  return (
    <RequireAuth>
      <RequireRole allowed={allowed}>{element}</RequireRole>
    </RequireAuth>
  );
}

const CUST = ["customer"];
const CATR = ["caterer"];

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div />}>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer */}
          <Route path="/customer"               element={<C allowed={CUST} element={<CustomerDashboard />} />} />
          <Route path="/customer/search"        element={<C allowed={CUST} element={<SearchPage />} />} />
          <Route path="/customer/services"      element={<Navigate to="/services" replace />} />
          <Route path="/customer/food/:id"      element={<C allowed={CUST} element={<FoodDetailsPage />} />} />
          <Route path="/customer/orders"        element={<C allowed={CUST} element={<CustomerOrdersPage />} />} />
          <Route path="/customer/profile"       element={<C allowed={CUST} element={<ProfilePage />} />} />
          <Route path="/customer/offers"        element={<C allowed={CUST} element={<OffersPage />} />} />
          <Route path="/customer/notifications" element={<C allowed={CUST} element={<NotificationsPage />} />} />
          <Route path="/cart"                   element={<C allowed={CUST} element={<CartPage />} />} />

          {/* Services */}
          <Route path="/services"               element={<C allowed={CUST} element={<ServicesPage />} />} />
          <Route path="/services/catering"      element={<C allowed={CUST} element={<CateringPage />} />} />
          <Route path="/services/catering/:id"  element={<C allowed={CUST} element={<CatererDetailPage />} />} />
          <Route path="/services/tiffins"       element={<C allowed={CUST} element={<TiffinsPage />} />} />
          <Route path="/services/book-cook"     element={<C allowed={CUST} element={<BookCookPage />} />} />
          <Route path="/services/home-food"     element={<C allowed={CUST} element={<HomeFoodPage />} />} />
          <Route path="/services/training"      element={<C allowed={CUST} element={<TrainingPage />} />} />

          {/* Caterer */}
          <Route path="/caterer"                element={<C allowed={CATR} element={<CatererDashboard />} />} />
          <Route path="/caterer/add-food"       element={<C allowed={CATR} element={<AddFoodPage />} />} />
          <Route path="/caterer/foods"          element={<C allowed={CATR} element={<FoodListPage />} />} />
          <Route path="/caterer/orders"         element={<C allowed={CATR} element={<CatererOrdersPage />} />} />

          <Route path="/" element={<Navigate to="/customer" replace />} />
          <Route path="*" element={<div style={{ padding: 24 }}>Page not found.</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
