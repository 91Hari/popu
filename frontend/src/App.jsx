import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NetworkProvider } from "./contexts/NetworkContext";
import MaintenanceScreen from "./components/MaintenanceScreen";
import { useNetwork } from "./contexts/NetworkContext";

/** Shows MaintenanceScreen when backend signals maintenance mode */
function MaintenanceGate({ children }) {
  const { isMaintenance } = useNetwork();
  if (isMaintenance) return <MaintenanceScreen />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NetworkProvider>
        <MaintenanceGate>
          <CartProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </CartProvider>
        </MaintenanceGate>
      </NetworkProvider>
    </ThemeProvider>
  );
}
