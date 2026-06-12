import { useEffect, useState } from "react";
import {
  Container, Box, Grid, Card, CardContent, Typography,
  CircularProgress, Alert, Skeleton, Divider,
} from "@mui/material";
import PeopleRoundedIcon             from "@mui/icons-material/PeopleRounded";
import StorefrontRoundedIcon         from "@mui/icons-material/StorefrontRounded";
import RestaurantMenuRoundedIcon     from "@mui/icons-material/RestaurantMenuRounded";
import ReceiptLongRoundedIcon        from "@mui/icons-material/ReceiptLongRounded";
import HourglassEmptyRoundedIcon     from "@mui/icons-material/HourglassEmptyRounded";
import CurrencyRupeeRoundedIcon      from "@mui/icons-material/CurrencyRupeeRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import StoreMallDirectoryRoundedIcon from "@mui/icons-material/StoreMallDirectoryRounded";
import PercentRoundedIcon            from "@mui/icons-material/PercentRounded";
import AccountBalanceRoundedIcon     from "@mui/icons-material/AccountBalanceRounded";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

const PLATFORM_DEFS = [
  { key: "totalCustomers", label: "Customers",     color: brand.orange,  bg: brand.orangeLight, icon: <PeopleRoundedIcon /> },
  { key: "totalCaterers",  label: "Caterers",      color: brand.gold,    bg: brand.goldLight,   icon: <StorefrontRoundedIcon /> },
  { key: "totalFoods",     label: "Food Items",    color: brand.green,   bg: brand.greenLight,  icon: <RestaurantMenuRoundedIcon /> },
  { key: "totalOrders",    label: "Total Orders",  color: brand.orange,  bg: brand.orangeLight, icon: <ReceiptLongRoundedIcon /> },
  { key: "pendingOrders",  label: "Pending",       color: brand.gold,    bg: brand.goldLight,   icon: <HourglassEmptyRoundedIcon /> },
  { key: "totalOrderValue",label: "Order Value",   color: brand.green,   bg: brand.greenLight,  icon: <CurrencyRupeeRoundedIcon />, prefix: "₹" },
];

const FINANCIAL_DEFS = [
  { key: "totalOrderValue",    label: "Gross Order Value",     color: brand.orange,  bg: brand.orangeLight, icon: <StoreMallDirectoryRoundedIcon />, prefix: "₹" },
  { key: "totalCommission",    label: "Commission Collected",  color: "#C62828",     bg: "#FFEBEE",         icon: <PercentRoundedIcon />,            prefix: "₹" },
  { key: "totalPlatformFees",  label: "Platform Fees",         color: "#6A1B9A",     bg: "#F3E5F5",         icon: <AccountBalanceRoundedIcon />,     prefix: "₹" },
  { key: "totalCatererPayout", label: "Caterer Payout",        color: brand.green,   bg: brand.greenLight,  icon: <CurrencyRupeeRoundedIcon />,      prefix: "₹" },
];

function StatCard({ def, value, loading }) {
  return (
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
                {def.prefix || ""}{value ?? "—"}
              </Typography>
          }
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

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

        {/* Platform stats */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {PLATFORM_DEFS.map((def) => (
            <Grid item xs={12} sm={6} md={4} key={def.key}>
              <StatCard def={def} value={stats?.[def.key]} loading={loading} />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", px: 1 }}>
            FINANCIALS (DELIVERED ORDERS)
          </Typography>
        </Divider>

        {/* Financial metrics */}
        <Grid container spacing={2}>
          {FINANCIAL_DEFS.map((def) => (
            <Grid item xs={12} sm={6} md={3} key={def.key}>
              <StatCard def={def} value={stats?.[def.key]} loading={loading} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </AppLayout>
  );
}
