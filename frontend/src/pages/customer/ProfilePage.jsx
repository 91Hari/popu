import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
} from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import BackButton from "../../components/BackButton";

const MENU = [
  { label: "My Bookings", to: "/customer/orders", icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { label: "My Orders", to: "/customer/orders", icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { label: "My Addresses", to: null, icon: <LocationOnRoundedIcon fontSize="small" /> },
  { label: "Payment Methods", to: null, icon: <PaymentRoundedIcon fontSize="small" /> },
  { label: "Wallet & Offers", to: "/customer/offers", icon: <LocalOfferRoundedIcon fontSize="small" /> },
  { label: "Settings", to: null, icon: <SettingsRoundedIcon fontSize="small" /> },
];

export default function ProfilePage() {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AppLayout>

      <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
        <BackButton sx={{ mb: 1 }} />
        {/* Avatar card */}
        <Card sx={{ textAlign: "center", p: 3, mb: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 1.5,
              bgcolor: brand.orange,
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            {(user.name || "P")[0].toUpperCase()}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {user.name || "Priya Sharma"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {user.email || "priya@email.com"}
          </Typography>
          {user.phone && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              +91 {user.phone}
            </Typography>
          )}
        </Card>

        <List disablePadding>
          {MENU.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => item.to && navigate(item.to)}
              sx={{
                px: 1,
                py: 1.5,
                borderBottom: `1px solid ${brand.border}`,
                "& .MuiListItemIcon-root": { color: brand.orange, minWidth: 38 },
                "&:hover": { backgroundColor: brand.orangeLight },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 500 }}
              />
              <ChevronRightRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            </ListItemButton>
          ))}
        </List>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutRoundedIcon />}
          onClick={handleLogout}
          sx={{ mt: 3 }}
        >
          Log Out
        </Button>
      </Container>
    </AppLayout>
  );
}
