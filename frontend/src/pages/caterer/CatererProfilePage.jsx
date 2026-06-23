import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Avatar, Button, List,
  ListItemButton, ListItemIcon, ListItemText, Card,
  Snackbar, Alert, CircularProgress, Box,
} from "@mui/material";
import ChevronRightRoundedIcon   from "@mui/icons-material/ChevronRightRounded";
import LogoutRoundedIcon         from "@mui/icons-material/LogoutRounded";
import PhonelinkRoundedIcon      from "@mui/icons-material/PhonelinkRounded";
import SettingsRoundedIcon       from "@mui/icons-material/SettingsRounded";
import PersonRoundedIcon         from "@mui/icons-material/PersonRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import LogoutConfirmationDialog from "../../components/LogoutConfirmationDialog";
import api from "../../services/api";

const MENU = [
  { label: "Payment Details", to: "/caterer/profile/payment",  icon: <PhonelinkRoundedIcon fontSize="small" /> },
  { label: "Settings",        to: "/caterer/profile/settings", icon: <SettingsRoundedIcon fontSize="small" /> },
];

export default function CatererProfilePage() {
  const navigate = useNavigate();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
  })();

  const [profile,     setProfile]     = useState(null);
  const [fetching,    setFetching]    = useState(true);
  const [logoutOpen,  setLogoutOpen]  = useState(false);
  const [toastOpen,   setToastOpen]   = useState(false);

  useEffect(() => {
    api.request("/caterers/me")
      .then(({ profile: p }) => setProfile(p))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToastOpen(true);
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <PersonRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>My Profile</Typography>
        </Box>

        {/* Identity card */}
        <Card sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5, mb: 2 }}>
          {fetching ? (
            <CircularProgress size={20} sx={{ color: brand.orange, mx: "auto" }} />
          ) : (
            <>
              <Avatar sx={{ width: 60, height: 60, bgcolor: brand.orange, fontWeight: 800, fontSize: "1.5rem" }}>
                {(user.name || "C")[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {profile?.business_name || user.name || "—"}
                </Typography>
                {profile?.business_name && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {profile.name || user.name}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: "text.secondary" }}>{user.email}</Typography>
                {(user.phone || profile?.phone) && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    +91 {user.phone || profile?.phone}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Card>

        {/* Menu */}
        <List disablePadding>
          {MENU.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.to)}
              sx={{
                px: 1, py: 1.5,
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
          fullWidth variant="outlined"
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

      <Snackbar open={toastOpen} autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600 }}>
          Logged out successfully. See you soon!
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
