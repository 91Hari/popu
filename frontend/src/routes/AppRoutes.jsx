import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="/search" element={<FoodSearchPage />} />
        <Route path="/food/:id" element={<FoodDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/caterer" element={<CatererDashboard />} />
        <Route path="/caterer/add" element={<AddFoodPage />} />
        <Route path="/caterer/foods" element={<FoodListPage />} />
        <Route path="/caterer/orders" element={<CatererOrdersPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
