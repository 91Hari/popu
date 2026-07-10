import React, { Suspense, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { CircularProgress, Box } from "@mui/material";
import { brand } from "../theme";
import ErrorBoundary from "../components/ErrorBoundary";

// Landing
const LandingPage = React.lazy(() => import("../pages/LandingPage"));

// Auth
const LoginPage             = React.lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage          = React.lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPasswordPage    = React.lazy(() => import("../pages/auth/ForgotPasswordPage"));
const ResetPasswordPage     = React.lazy(() => import("../pages/auth/ResetPasswordPage"));

// Customer
const CustomerDashboard  = React.lazy(() => import("../pages/customer/CustomerDashboard"));
const SearchPage         = React.lazy(() => import("../pages/customer/SearchPage"));
const FoodDetailsPage    = React.lazy(() => import("../pages/customer/FoodDetailsPage"));
const ProfilePage        = React.lazy(() => import("../pages/customer/ProfilePage"));
const OffersPage         = React.lazy(() => import("../pages/customer/OffersPage"));
const NotificationsPage  = React.lazy(() => import("../pages/customer/NotificationsPage"));
const CartPage           = React.lazy(() => import("../pages/customer/CartPage"));
const SplitCheckoutPage  = React.lazy(() => import("../pages/customer/SplitCheckoutPage"));
const MasterOrdersPage   = React.lazy(() => import("../pages/customer/MasterOrdersPage"));
const RiderTrackingPage    = React.lazy(() => import("../pages/customer/RiderTrackingPage"));
const CustomerPickupPage   = React.lazy(() => import("../pages/customer/CustomerPickupPage"));

// Services
const ServicesPage      = React.lazy(() => import("../pages/services/ServicesPage"));
const CateringPage      = React.lazy(() => import("../pages/services/CateringPage"));
const CatererDetailPage = React.lazy(() => import("../pages/services/CatererDetailPage"));
const TiffinsPage       = React.lazy(() => import("../pages/services/TiffinsPage"));
const BookCookPage      = React.lazy(() => import("../pages/services/BookCookPage"));
const HomeFoodPage      = React.lazy(() => import("../pages/services/HomeFoodPage"));
const TrainingPage      = React.lazy(() => import("../pages/services/TrainingPage"));

// Caterer
const CatererDashboard        = React.lazy(() => import("../pages/caterer/CatererDashboard"));
const AddFoodPage              = React.lazy(() => import("../pages/caterer/AddFoodPage"));
const FoodListPage             = React.lazy(() => import("../pages/caterer/FoodListPage"));
const AvailabilityPage           = React.lazy(() => import("../pages/caterer/AvailabilityPage"));
const CatererNotificationsPage   = React.lazy(() => import("../pages/caterer/CatererNotificationsPage"));
const CatererSubOrdersPage       = React.lazy(() => import("../pages/caterer/CatererSubOrdersPage"));
const CatererPaymentReviewPage   = React.lazy(() => import("../pages/caterer/CatererPaymentReviewPage"));

// Caterer extras
const CatererCateringServicesPage  = React.lazy(() => import("../pages/caterer/CatererCateringServicesPage"));
const CatererCateringBookingsPage  = React.lazy(() => import("../pages/caterer/CatererCateringBookingsPage"));
const CatererRidersPage            = React.lazy(() => import("../pages/caterer/CatererRidersPage"));
const CatererProfilePage           = React.lazy(() => import("../pages/caterer/CatererProfilePage"));
const CatererPaymentDetailsPage    = React.lazy(() => import("../pages/caterer/CatererPaymentDetailsPage"));
const EditFoodPage                 = React.lazy(() => import("../pages/caterer/EditFoodPage"));

// Customer extras
const BookCateringPage             = React.lazy(() => import("../pages/customer/BookCateringPage"));
const CustomerCateringBookingsPage = React.lazy(() => import("../pages/customer/CustomerCateringBookingsPage"));
const AddressManagementPage        = React.lazy(() => import("../pages/customer/AddressManagementPage"));
const PaymentMethodsPage           = React.lazy(() => import("../pages/customer/PaymentMethodsPage"));
const ProfileSettingsPage          = React.lazy(() => import("../pages/customer/ProfileSettingsPage"));

// Rider portal
const RiderDashboard       = React.lazy(() => import("../pages/rider/RiderDashboard"));
const RiderOrderLookupPage = React.lazy(() => import("../pages/rider/RiderOrderLookupPage"));
const RiderDeliveryPage    = React.lazy(() => import("../pages/rider/RiderDeliveryPage"));
const RiderActiveBatchPage = React.lazy(() => import("../pages/rider/RiderActiveBatchPage"));

// Admin
const AdminDashboard       = React.lazy(() => import("../pages/admin/AdminDashboard"));
const HealthDashboard      = React.lazy(() => import("../pages/admin/HealthDashboard"));
const CustomersPage        = React.lazy(() => import("../pages/admin/CustomersPage"));
const AdminCaterersPage    = React.lazy(() => import("../pages/admin/CaterersPage"));
const AdminFoodsPage       = React.lazy(() => import("../pages/admin/AdminFoodsPage"));
const AdminOrdersPage      = React.lazy(() => import("../pages/admin/AdminOrdersPage"));
const AdminNotifPage         = React.lazy(() => import("../pages/admin/AdminNotificationsPage"));
const ReportsPage            = React.lazy(() => import("../pages/admin/ReportsPage"));
const SettingsPage           = React.lazy(() => import("../pages/admin/SettingsPage"));
const AdminMasterOrdersPage      = React.lazy(() => import("../pages/admin/AdminMasterOrdersPage"));
const AdminRidersPage            = React.lazy(() => import("../pages/admin/AdminRidersPage"));
const AdminCateringBookingsPage  = React.lazy(() => import("../pages/admin/AdminCateringBookingsPage"));
const PlatformSettingsPage       = React.lazy(() => import("../pages/admin/PlatformSettingsPage"));
const AdminPaymentsPage              = React.lazy(() => import("../pages/admin/AdminPaymentsPage"));
const AdminRefundsPage               = React.lazy(() => import("../pages/admin/AdminRefundsPage"));
const ServiceManagementPage          = React.lazy(() => import("../pages/admin/ServiceManagementPage"));
const AdminAccountManagementPage     = React.lazy(() => import("../pages/admin/AdminAccountManagementPage"));
const AdminDeliveryManagementPage    = React.lazy(() => import("../pages/admin/AdminDeliveryManagementPage"));
const PaymentCallbackPage        = React.lazy(() => import("../pages/customer/PaymentCallbackPage"));

// Tiffin Box module
const TiffinBoxPage     = React.lazy(() => import("../pages/customer/TiffinBoxPage"));
const TiffinOrdersPage  = React.lazy(() => import("../pages/customer/TiffinOrdersPage"));
const CatererTiffinPage = React.lazy(() => import("../pages/caterer/CatererTiffinPage"));
const AdminTiffinPage   = React.lazy(() => import("../pages/admin/AdminTiffinPage"));

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
    if (isAuthenticated()) {
      if (role === "caterer") return <Navigate to="/caterer" replace />;
      if (role === "admin")   return <Navigate to="/admin"   replace />;
      if (role === "rider")   return <Navigate to="/rider"   replace />;
      return <Navigate to="/customer" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  return children;
}

function C({ allowed, element }) {
  return <RequireAuth><RequireRole allowed={allowed}>{element}</RequireRole></RequireAuth>;
}

const CUST  = ["customer"];
const CATR  = ["caterer"];
const ADMIN = ["admin"];
const RIDER = ["rider"];

const Loader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
    <CircularProgress sx={{ color: brand.orange }} />
  </Box>
);

export default function AppRoutes() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
          <Route path="/reset-password"   element={<ResetPasswordPage />} />

          {/* Customer */}
          <Route path="/customer"               element={<ErrorBoundary><C allowed={CUST} element={<CustomerDashboard />} /></ErrorBoundary>} />
          <Route path="/customer/search"        element={<ErrorBoundary><C allowed={CUST} element={<SearchPage />} /></ErrorBoundary>} />
          <Route path="/customer/services"      element={<Navigate to="/services" replace />} />
          <Route path="/customer/food/:id"      element={<ErrorBoundary><C allowed={CUST} element={<FoodDetailsPage />} /></ErrorBoundary>} />
          <Route path="/customer/orders"        element={<Navigate to="/customer/master-orders" replace />} />
          <Route path="/customer/profile"                    element={<ErrorBoundary><C allowed={CUST} element={<ProfilePage />} /></ErrorBoundary>} />
          <Route path="/customer/profile/addresses"        element={<ErrorBoundary><C allowed={CUST} element={<AddressManagementPage />} /></ErrorBoundary>} />
          <Route path="/customer/profile/payment-methods"  element={<ErrorBoundary><C allowed={CUST} element={<PaymentMethodsPage />} /></ErrorBoundary>} />
          <Route path="/customer/profile/settings"         element={<ErrorBoundary><C allowed={CUST} element={<ProfileSettingsPage />} /></ErrorBoundary>} />
          <Route path="/customer/offers"        element={<ErrorBoundary><C allowed={CUST} element={<OffersPage />} /></ErrorBoundary>} />
          <Route path="/customer/notifications"   element={<ErrorBoundary><C allowed={CUST} element={<NotificationsPage />} /></ErrorBoundary>} />
          <Route path="/cart"                     element={<ErrorBoundary><C allowed={CUST} element={<CartPage />} /></ErrorBoundary>} />
          <Route path="/checkout/split"           element={<ErrorBoundary><C allowed={CUST} element={<SplitCheckoutPage />} /></ErrorBoundary>} />
          <Route path="/customer/master-orders"   element={<ErrorBoundary><C allowed={CUST} element={<MasterOrdersPage />} /></ErrorBoundary>} />
          <Route path="/customer/track/:orderId"    element={<ErrorBoundary><C allowed={CUST} element={<RiderTrackingPage />} /></ErrorBoundary>} />
          <Route path="/customer/pickup/:masterOrderId" element={<ErrorBoundary><C allowed={CUST} element={<CustomerPickupPage />} /></ErrorBoundary>} />
          <Route path="/payment/callback"          element={<ErrorBoundary><C allowed={CUST} element={<PaymentCallbackPage />} /></ErrorBoundary>} />

          {/* Services */}
          <Route path="/services"               element={<ErrorBoundary><C allowed={CUST} element={<ServicesPage />} /></ErrorBoundary>} />
          <Route path="/services/catering"      element={<ErrorBoundary><C allowed={CUST} element={<CateringPage />} /></ErrorBoundary>} />
          <Route path="/services/catering/:id"  element={<ErrorBoundary><C allowed={CUST} element={<CatererDetailPage />} /></ErrorBoundary>} />
          <Route path="/services/food-marketplace" element={<ErrorBoundary><C allowed={CUST} element={<TiffinsPage />} /></ErrorBoundary>} />
          <Route path="/services/tiffins"         element={<Navigate to="/services/food-marketplace" replace />} />
          <Route path="/services/book-cook"     element={<ErrorBoundary><C allowed={CUST} element={<BookCookPage />} /></ErrorBoundary>} />
          <Route path="/services/home-food"     element={<ErrorBoundary><C allowed={CUST} element={<HomeFoodPage />} /></ErrorBoundary>} />
          <Route path="/services/training"      element={<ErrorBoundary><C allowed={CUST} element={<TrainingPage />} /></ErrorBoundary>} />

          {/* Caterer */}
          <Route path="/caterer"                    element={<C allowed={CATR} element={<CatererDashboard />} />} />
          <Route path="/caterer/add-food"           element={<C allowed={CATR} element={<AddFoodPage />} />} />
          <Route path="/caterer/edit-food/:id"      element={<C allowed={CATR} element={<EditFoodPage />} />} />
          <Route path="/caterer/foods"              element={<C allowed={CATR} element={<FoodListPage />} />} />
          <Route path="/caterer/orders"             element={<Navigate to="/caterer/sub-orders" replace />} />
          <Route path="/caterer/availability"       element={<C allowed={CATR} element={<AvailabilityPage />} />} />
          <Route path="/caterer/notifications"      element={<C allowed={CATR} element={<CatererNotificationsPage />} />} />
          <Route path="/caterer/sub-orders"         element={<C allowed={CATR} element={<CatererSubOrdersPage />} />} />
          <Route path="/caterer/payment-review"     element={<C allowed={CATR} element={<CatererPaymentReviewPage />} />} />
          <Route path="/caterer/catering"           element={<C allowed={CATR} element={<CatererCateringServicesPage />} />} />
          <Route path="/caterer/catering-bookings"  element={<C allowed={CATR} element={<CatererCateringBookingsPage />} />} />
          <Route path="/caterer/riders"             element={<C allowed={CATR} element={<CatererRidersPage />} />} />
          <Route path="/caterer/profile"                   element={<C allowed={CATR} element={<CatererProfilePage />} />} />
          <Route path="/caterer/profile/payment"          element={<C allowed={CATR} element={<CatererPaymentDetailsPage />} />} />
          <Route path="/caterer/profile/addresses"        element={<C allowed={CATR} element={<AddressManagementPage />} />} />
          <Route path="/caterer/profile/settings"         element={<C allowed={CATR} element={<ProfileSettingsPage />} />} />
          {/* Tiffin Box — caterer */}
          <Route path="/caterer/tiffin"             element={<C allowed={CATR} element={<CatererTiffinPage />} />} />

          {/* Customer catering */}
          <Route path="/customer/catering-booking/:catererId" element={<ErrorBoundary><C allowed={CUST} element={<BookCateringPage />} /></ErrorBoundary>} />
          <Route path="/customer/catering-bookings"           element={<ErrorBoundary><C allowed={CUST} element={<CustomerCateringBookingsPage />} /></ErrorBoundary>} />

          {/* Tiffin Box — customer */}
          <Route path="/services/tiffin-box"       element={<ErrorBoundary><C allowed={CUST} element={<TiffinBoxPage />} /></ErrorBoundary>} />
          <Route path="/customer/tiffin-orders"    element={<ErrorBoundary><C allowed={CUST} element={<TiffinOrdersPage />} /></ErrorBoundary>} />

          {/* Rider portal */}
          <Route path="/rider"                element={<C allowed={RIDER} element={<RiderDashboard />} />} />
          <Route path="/rider/lookup"         element={<C allowed={RIDER} element={<RiderOrderLookupPage />} />} />
          <Route path="/rider/delivery/:id"   element={<C allowed={RIDER} element={<RiderDeliveryPage />} />} />
          <Route path="/rider/batch"          element={<C allowed={RIDER} element={<RiderActiveBatchPage />} />} />

          {/* Admin */}
          <Route path="/admin"               element={<C allowed={ADMIN} element={<AdminDashboard />} />} />
          <Route path="/admin/customers"     element={<C allowed={ADMIN} element={<CustomersPage />} />} />
          <Route path="/admin/caterers"      element={<C allowed={ADMIN} element={<AdminCaterersPage />} />} />
          <Route path="/admin/foods"         element={<C allowed={ADMIN} element={<AdminFoodsPage />} />} />
          <Route path="/admin/orders"        element={<C allowed={ADMIN} element={<AdminOrdersPage />} />} />
          <Route path="/admin/notifications" element={<C allowed={ADMIN} element={<AdminNotifPage />} />} />
          <Route path="/admin/reports"         element={<C allowed={ADMIN} element={<ReportsPage />} />} />
          <Route path="/admin/settings"       element={<C allowed={ADMIN} element={<SettingsPage />} />} />
          <Route path="/admin/master-orders"      element={<C allowed={ADMIN} element={<AdminMasterOrdersPage />} />} />
          <Route path="/admin/riders"             element={<C allowed={ADMIN} element={<AdminRidersPage />} />} />
          <Route path="/admin/catering-bookings"   element={<C allowed={ADMIN} element={<AdminCateringBookingsPage />} />} />
          <Route path="/admin/platform-settings"  element={<C allowed={ADMIN} element={<PlatformSettingsPage />} />} />
          <Route path="/admin/payments"            element={<C allowed={ADMIN} element={<AdminPaymentsPage />} />} />
          <Route path="/admin/refunds"             element={<C allowed={ADMIN} element={<AdminRefundsPage />} />} />
          <Route path="/admin/services"            element={<C allowed={ADMIN} element={<ServiceManagementPage />} />} />
          {/* Tiffin Box — admin */}
          <Route path="/admin/tiffin"              element={<C allowed={ADMIN} element={<AdminTiffinPage />} />} />
          <Route path="/admin/account-management" element={<C allowed={ADMIN} element={<AdminAccountManagementPage />} />} />
          <Route path="/admin/delivery"           element={<C allowed={ADMIN} element={<AdminDeliveryManagementPage />} />} />
          <Route path="/admin/health"             element={<C allowed={ADMIN} element={<HealthDashboard />} />} />

          {/* Root: auto-route based on auth state */}
          <Route path="/" element={
            isAuthenticated()
              ? (() => { const r = getUserRole(); return <Navigate to={r === 'caterer' ? '/caterer' : r === 'admin' ? '/admin' : r === 'rider' ? '/rider' : '/customer'} replace />; })()
              : <Navigate to="/login" replace />
          } />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
