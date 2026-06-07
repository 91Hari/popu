import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import FoodSearchPage from "../pages/customer/FoodSearchPage";
import FoodDetailsPage from "../pages/customer/FoodDetailsPage";
import CartPage from "../pages/customer/CartPage";
import OrdersPage from "../pages/customer/OrdersPage";
import CatererDashboard from "../pages/caterer/CatererDashboard";
import AddFoodPage from "../pages/caterer/AddFoodPage";
import FoodListPage from "../pages/caterer/FoodListPage";
import CatererOrdersPage from "../pages/caterer/CatererOrdersPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <FoodSearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food/:id"
          element={
            <ProtectedRoute>
              <FoodDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/caterer"
          element={
            <ProtectedRoute>
              <CatererDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caterer/add"
          element={
            <ProtectedRoute>
              <AddFoodPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caterer/foods"
          element={
            <ProtectedRoute>
              <FoodListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caterer/orders"
          element={
            <ProtectedRoute>
              <CatererOrdersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
