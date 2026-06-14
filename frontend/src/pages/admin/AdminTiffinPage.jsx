import { useEffect, useState } from "react";
import {
  Box, Container, Typography, Card, CardContent,
  Grid, CircularProgress, Alert, Skeleton,
} from "@mui/material";
import DinnerDiningRoundedIcon  from "@mui/icons-material/DinnerDiningRounded";
import ReceiptLongRoundedIcon   from "@mui/icons-material/ReceiptLongRounded";
import DateRangeRoundedIcon     from "@mui/icons-material/DateRangeRounded";
import TodayRoundedIcon         from "@mui/icons-material/TodayRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import StorefrontRoundedIcon    from "@mui/icons-material/StorefrontRounded";
import AppLayout                from "../../components/AppLayout";
import tiffinService            from "../../services/tiffinService";
import { brand }                from "../../theme";

const METRIC_DEFS = [
  { key: "totalOrders",    label: "Total Lunch Box Orders",    icon: <ReceiptLongRoundedIcon />,   color: brand.orange,  bg: brand.orangeLight },
  { key: "revenue",        label: "Lunch Box Revenue",         icon: <CurrencyRupeeRoundedIcon />, color: brand.green,   bg: brand.greenLight,  prefix: "₹" },
  { key: "dailySubs",      label: "Daily Subscriptions",       icon: <DateRangeRoundedIcon />,     color: "#1565C0",     bg: "#E3F2FD" },
  { key: "todayOrders",    label: "Today's Lunch Box Orders",  icon: <TodayRoundedIcon />,         color: "#6A1B9A",     bg: "#F3E5F5" },
  { key: "activeCaterers", label: "Active Lunch Box Caterers", icon: <StorefrontRoundedIcon />,    color: brand.gold,    bg: brand.goldLight },
];

function MetricCard({ def, value, loading }) {
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

export default function AdminTiffinPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    tiffinService.getAdminMetrics()
      .then((r) => setMetrics(r.metrics))
      .catch((err) => setError(err?.message || "Failed to load tiffin metrics."))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (key) => {
    if (!metrics) return "—";
    const v = metrics[key];
    if (v == null) return "—";
    if (key === "revenue") return Number(v).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return String(v);
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <DinnerDiningRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Lunch Box Overview</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          {METRIC_DEFS.map((def) => (
            <Grid item xs={12} sm={6} md={4} key={def.key}>
              <MetricCard def={def} value={fmt(def.key)} loading={loading} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </AppLayout>
  );
}
