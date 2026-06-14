import { useState } from "react";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, TextField, InputAdornment, Divider,
} from "@mui/material";
import SearchRoundedIcon       from "@mui/icons-material/SearchRounded";
import DiningIcon from "@mui/icons-material/Dining";
import PersonRoundedIcon       from "@mui/icons-material/PersonRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import riderService from "../../services/riderService";

const STATUS_LABELS = {
  PLACED: "Placed", ACCEPTED: "Accepted", PREPARING: "Preparing",
  READY: "Ready", ASSIGNED_TO_RIDER: "Assigned to Rider",
  OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled",
};

export default function RiderOrderLookupPage() {
  const [input, setInput]   = useState("");
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSearch = async () => {
    const id = input.trim();
    if (!id) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const data = await riderService.lookupOrder(id);
      setOrder(data);
    } catch (err) {
      setError(err?.message || "Order not found. Check the order ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <SearchRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Order Lookup</Typography>
        </Box>

        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          sx={{ display: "flex", gap: 1, mb: 3 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Enter Order ID (e.g. 3f8a1b2c-…)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 6 } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!input.trim() || loading}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700, px: 3, borderRadius: 6 }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Search"}
          </Button>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {order && (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                    Order #{order.id?.slice(0, 8).toUpperCase()}
                  </Typography>
                  <Chip
                    label={STATUS_LABELS[order.status] || order.status}
                    size="small"
                    color={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "default" : "primary"}
                    sx={{ fontWeight: 700, mt: 0.5 }}
                  />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange }}>
                  ₹{Number(order.subtotal || 0).toFixed(2)}
                </Typography>
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              {/* Customer info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <PersonRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.customer_name}</Typography>
                  {order.customer_phone && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {order.customer_phone}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Items */}
              {Array.isArray(order.items) && order.items.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Items
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.75 }}>
                    {order.items.map((it, i) => (
                      <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <DiningIcon sx={{ fontSize: 14, color: brand.orange }} />
                          <Typography variant="body2">{it.food_name}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {it.quantity} × ₹{Number(it.unit_price || 0).toFixed(0)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Container>
    </AppLayout>
  );
}
