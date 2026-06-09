import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
