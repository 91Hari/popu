import { useEffect, useState } from "react";
import {
  Container, Box, Grid, Card, CardContent, Typography,
  CircularProgress, Alert, Skeleton,
} from "@mui/material";
import PeopleRoundedIcon          from "@mui/icons-material/PeopleRounded";
import StorefrontRoundedIcon      from "@mui/icons-material/StorefrontRounded";
import RestaurantMenuRoundedIcon  from "@mui/icons-material/RestaurantMenuRounded";
import ReceiptLongRoundedIcon     from "@mui/icons-material/ReceiptLongRounded";
import HourglassEmptyRoundedIcon  from "@mui/icons-material/HourglassEmptyRounded";
import AttachMoneyRoundedIcon     from "@mui/icons-material/AttachMoneyRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AppLayout  from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand } from "../../theme";

const STAT_DEFS = [
  { key: "totalCustomers", label: "Customers",     color: "#1565c0", bg: "#E3F2FD", icon: <PeopleRoundedIcon /> },
  { key: "totalCaterers",  label: "Caterers",      color: brand.orange, bg: brand.orangeLight, icon: <StorefrontRoundedIcon /> },
  { key: "totalFoods",     label: "Food Items",    color: "#2e7d32", bg: "#E8F5E9", icon: <RestaurantMenuRoundedIcon /> },
  { key: "totalOrders",    label: "Total Orders",  color: "#6a1b9a", bg: "#F3E5F5", icon: <ReceiptLongRoundedIcon /> },
  { key: "pendingOrders",  label: "Pending",       color: "#e65100", bg: "#FFF3E0", icon: <HourglassEmptyRoundedIcon /> },
  { key: "revenue",        label: "Revenue",       color: "#1b5e20", bg: "#E8F5E9", icon: <AttachMoneyRoundedIcon />, prefix: "₹" },
];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    adminService.getDashboard()
      .then(setStats)
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <AdminPanelSettingsRoundedIcon sx={{ color: brand.orange, fontSize: 30 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Admin Dashboard</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Platform overview and management</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          {STAT_DEFS.map((def) => (
            <Grid item xs={12} sm={6} md={4} key={def.key}>
              <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderLeft: `4px solid ${def.color}` }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "20px !important" }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2,
                    backgroundColor: def.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: def.color, flexShrink: 0,
                  }}>
                    {def.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>{def.label}</Typography>
                    {loading
                      ? <Skeleton width={72} height={36} />
                      : <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1, color: def.color }}>
                          {def.prefix || ""}{stats?.[def.key] ?? "—"}
                        </Typography>
                    }
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </AppLayout>
  );
}
