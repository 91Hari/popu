import { useEffect, useState } from "react";
import {
  Container, Box, Typography, Grid, Card, CardContent, Skeleton,
} from "@mui/material";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

export default function ReportsPage() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    adminService.getDashboard().then(setStats).finally(() => setLoad(false));
  }, []);

  const metrics = stats ? [
    { label: "Order Completion Rate", value: stats.totalOrders > 0 ? `${Math.round((Number(stats.totalOrders) - Number(stats.pendingOrders)) / Number(stats.totalOrders) * 100)}%` : "—" },
    { label: "Total Revenue",         value: `₹${stats.revenue}` },
    { label: "Avg Revenue / Order",   value: stats.totalOrders > 0 ? `₹${(parseFloat(stats.revenue) / Number(stats.totalOrders)).toFixed(2)}` : "—" },
    { label: "Active Caterers",       value: String(stats.totalCaterers) },
    { label: "Active Customers",      value: String(stats.totalCustomers) },
    { label: "Food Items Listed",     value: String(stats.totalFoods) },
  ] : [];

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <AssessmentRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Reports</Typography>
        </Box>

        <Grid container spacing={2}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
                    <CardContent><Skeleton height={60} /></CardContent>
                  </Card>
                </Grid>
              ))
            : metrics.map((m) => (
                <Grid item xs={12} sm={6} md={4} key={m.label}>
                  <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderLeft: `4px solid ${brand.orange}` }}>
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "20px !important" }}>
                      <TrendingUpRoundedIcon sx={{ color: brand.orange, fontSize: 28, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>{m.label}</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: brand.orange, lineHeight: 1.1 }}>{m.value}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
          }
        </Grid>
      </Container>
    </AppLayout>
  );
}
