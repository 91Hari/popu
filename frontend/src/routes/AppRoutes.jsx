import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Lazy-loaded pages
const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/auth/RegisterPage"));

const CustomerDashboard = React.lazy(
  () => import("../pages/customer/CustomerDashboard"),
);
const SearchPage = React.lazy(() => import("../pages/customer/SearchPage"));
const ServicesPage = React.lazy(
  () => import("../pages/customer/ServicesPage"),
);
const FoodDetailsPage = React.lazy(
  () => import("../pages/customer/FoodDetailsPage"),
);
const ProfilePage = React.lazy(() => import("../pages/customer/ProfilePage"));
const OffersPage = React.lazy(() => import("../pages/customer/OffersPage"));
const CustomerOrdersPage = React.lazy(
  () => import("../pages/customer/OrdersPage"),
);

const CatererDashboard = React.lazy(
  () => import("../pages/caterer/CatererDashboard"),
);
const AddFoodPage = React.lazy(() => import("../pages/caterer/AddFoodPage"));
const FoodListPage = React.lazy(() => import("../pages/caterer/FoodListPage"));
const CatererOrdersPage = React.lazy(
  () => import("../pages/caterer/CatererOrdersPage"),
);

// Small helpers for auth/role checks using localStorage (keeps things simple)
function isAuthenticated() {
  try {
    return !!localStorage.getItem("token");
  } catch (e) {
    return false;
  }
}

function getUserRole() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.role || null;
  } catch (e) {
    return null;
  }
}

function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RequireRole({ allowed = [], children }) {
  const role = getUserRole();
  if (!role || !allowed.includes(role)) {
    // if authenticated but wrong role, redirect to a sensible default
    if (isAuthenticated()) {
      // send to customer dashboard if they're a customer, caterer dashboard if caterer
      return (
        <Navigate to={role === "caterer" ? "/caterer" : "/customer"} replace />
      );
    }
    return <Navigate to="/login" replace />;
  }
  return children;
}

function NotFound() {
  return <div style={{ padding: 24 }}>Page not found.</div>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer routes - require auth and customer role */}
          <Route
            path="/customer"
            element={
              <RequireAuth>
                <RequireRole allowed={["customer"]}>
                  <CustomerDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/customer/search"
            element={
              <RequireAuth>
                <RequireRole allowed={["customer"]}>
                  <SearchPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/customer/services"
            element={
              <RequireAuth>
                <RequireRole allowed={["customer"]}>
                  <ServicesPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/customer/food/:id"
            element={
              <RequireAuth>
                <RequireRole allowed={["customer"]}>
                  <FoodDetailsPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <RequireAuth>
                <RequireRole allowed={["customer"]}>
                  <CustomerOrdersPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <RequireAuth>
                <RequireRole allowed={["customer"]}>
                  <ProfilePage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/customer/offers"
            element={
              <RequireAuth>
                <RequireRole allowed={["customer"]}>
                  <OffersPage />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* Caterer routes - require auth and caterer role */}
          <Route
            path="/caterer"
            element={
              <RequireAuth>
                <RequireRole allowed={["caterer"]}>
                  <CatererDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/caterer/add-food"
            element={
              <RequireAuth>
                <RequireRole allowed={["caterer"]}>
                  <AddFoodPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/caterer/foods"
            element={
              <RequireAuth>
                <RequireRole allowed={["caterer"]}>
                  <FoodListPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/caterer/orders"
            element={
              <RequireAuth>
                <RequireRole allowed={["caterer"]}>
                  <CatererOrdersPage />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* Root and fallback */}
          <Route path="/" element={<Navigate to="/customer" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
