export { default } from "./routes/AppRoutes";

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
            path="/customer/orders"
            element={
              <RequireAuth>
                <RequireRole allowed={["customer"]}>
                  <CustomerOrdersPage />
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
