import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Divider,
} from "@mui/material";
import TwoWheelerRoundedIcon     from "@mui/icons-material/TwoWheelerRounded";
import SearchRoundedIcon         from "@mui/icons-material/SearchRounded";
import DiningIcon   from "@mui/icons-material/Dining";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import riderService from "../../services/riderService";

const STATUS_CFG = {
  ASSIGNED_TO_RIDER: { label: "Ready for Pickup",  color: "info" },
  OUT_FOR_DELIVERY:  { label: "Out for Delivery",  color: "warning" },
};

export default function RiderDashboard() {
  const navigate                  = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
  })();
  const firstName = (user.name || "Rider").split(" ")[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await riderService.getAssignedDeliveries();
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load deliveries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        {/* Greeting */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Hey, {firstName}!</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {deliveries.length} active delivery{deliveries.length !== 1 ? "s" : ""} assigned to you
          </Typography>
        </Box>

        {/* Quick actions */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<SearchRoundedIcon />}
            onClick={() => navigate("/rider/lookup")}
            sx={{ fontWeight: 700, color: brand.orange, borderColor: brand.orange, textTransform: "none" }}
          >
            Look Up Order
          </Button>
        </Stack>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : deliveries.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <TwoWheelerRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No active deliveries</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              When your caterer assigns you an order, it will appear here.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {deliveries.map((d) => {
              const cfg   = STATUS_CFG[d.status] || { label: d.status, color: "default" };
              const items = Array.isArray(d.items) ? d.items : [];
              return (
                <Card key={d.id} elevation={0} sx={{ border: `2px solid ${brand.orange}`, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                          Order #{d.id.slice(0, 8).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Customer: {d.customer_name}
                        </Typography>
                      </Box>
                      <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700 }} />
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                      {items.map((it, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <DiningIcon sx={{ fontSize: 14, color: brand.orange, flexShrink: 0 }} />
                          <Typography variant="caption">
                            {it.food_name} × {it.quantity}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      {d.status === "ASSIGNED_TO_RIDER" && (
                        <Button
                          size="small" variant="contained"
                          onClick={() => navigate(`/rider/delivery/${d.id}`)}
                          sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700 }}
                        >
                          Start Delivery
                        </Button>
                      )}
                      {d.status === "OUT_FOR_DELIVERY" && (
                        <Button
                          size="small" variant="contained"
                          onClick={() => navigate(`/rider/delivery/${d.id}`)}
                          sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700 }}
                        >
                          Enter Delivery Code
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </AppLayout>
  );
}
