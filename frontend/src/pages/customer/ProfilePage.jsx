import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import LogoutConfirmationDialog from "../../components/LogoutConfirmationDialog";

const MENU = [
  { label: "My Catering Bookings", to: "/customer/catering-bookings",      icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { label: "My Food Orders",       to: "/customer/master-orders",          icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { label: "Payment Methods", to: "/customer/profile/payment-methods",icon: <PaymentRoundedIcon fontSize="small" /> },
  { label: "Wallet & Offers", to: "/customer/offers",                 icon: <LocalOfferRoundedIcon fontSize="small" /> },
  { label: "Settings",        to: "/customer/profile/settings",       icon: <SettingsRoundedIcon fontSize="small" /> },
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

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AppLayout>

      <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>

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
            {user.name || ""}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {user.email || ""}
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
                slotProps={{ primary: { style: { fontSize: "0.95rem", fontWeight: 500 } } }}
              />
              <ChevronRightRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            </ListItemButton>
          ))}
        </List>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutRoundedIcon />}
          onClick={() => setLogoutOpen(true)}
          sx={{ mt: 3, borderColor: brand.border, color: "text.secondary", textTransform: "none", fontWeight: 600 }}
        >
          Log Out
        </Button>
      </Container>

      <LogoutConfirmationDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

    </AppLayout>
  );
}
