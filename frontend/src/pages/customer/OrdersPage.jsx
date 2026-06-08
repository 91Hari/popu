import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Toolbar, Typography, Card, CardContent,
  Stack, Chip, Button, CircularProgress, Alert, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import orderService from "../../services/orderService";
import TopNav from "../../components/TopNav";
import { brand } from "../../theme";
import { etaRange, formatArrivalTime } from "../../utils/geoUtils";

const STATUS_CFG = {
  PLACED:    { label: "Placed",    color: "info",    canCancel: true },
  ACCEPTED:  { label: "Accepted",  color: "primary", canCancel: true },
  PREPARING: { label: "Preparing", color: "warning", canCancel: false },
  DELIVERED: { label: "Delivered", color: "success", canCancel: false },
  CANCELLED: { label: "Cancelled", color: "default", canCancel: false },
};

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [cancelId, setCancelId]     = useState(null);
  const [reason, setReason]         = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const handleCancelConfirm = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(cancelId, reason);
      setOrders((prev) => prev.map((o) => o.id === cancelId ? { ...o, ...updated } : o));
      setCancelId(null);
      setReason("");
    } catch (err) {
      setError(err?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
        <TopNav />
        <Toolbar />
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Inventory2RoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>My Bookings</Typography>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <Inventory2RoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No orders yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Your orders will appear here once placed.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/services/tiffins")}>Browse Food</Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => {
              const statusKey = order.status || "PLACED";
              const cfg       = STATUS_CFG[statusKey] || { label: statusKey, color: "default", canCancel: false };
              const items     = Array.isArray(order.items) ? order.items : [];
              const hasEta    = order.eta_minutes != null;
              const arrival   = order.expected_arrival_at ? formatArrivalTime(order.expected_arrival_at) : null;

              return (
                <Card key={order.id} elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Placed: {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
                        </Typography>
                      </Box>
                      <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700 }} />
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Items */}
                    <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                      {items.map((it, idx) => (
                        <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <Box
                            sx={{
                              width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                              background: `linear-gradient(135deg, ${brand.orangeLight}, #FFD0A0)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <DinnerDiningRoundedIcon sx={{ fontSize: 18, color: brand.orange, opacity: 0.7 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {it.food_name || it.foodName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Qty: {it.quantity} × ₹{Number(it.unit_price || 0).toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                            ₹{Number(it.total_price || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Divider sx={{ mb: 1.25 }} />

                    {/* ETA row — only shown when ETA was calculated at order time */}
                    {hasEta && statusKey !== "DELIVERED" && statusKey !== "CANCELLED" && (
                      <Box
                        sx={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          mb: 1.25, p: 1, borderRadius: 1.5,
                          backgroundColor: "#E3F2FD", border: "1px solid #BBDEFB",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <DirectionsBikeRoundedIcon sx={{ fontSize: 16, color: "#1565c0" }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: 700, display: "block", lineHeight: 1.2 }}>
                              ETA
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#1565c0" }}>
                              {etaRange(order.eta_minutes)}
                            </Typography>
                          </Box>
                        </Box>
                        {arrival && (
                          <Box sx={{ textAlign: "right" }}>
                            <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: 700, display: "block", lineHeight: 1.2 }}>
                              Expected Arrival
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, justifyContent: "flex-end" }}>
                              <AccessTimeRoundedIcon sx={{ fontSize: 12, color: "#1565c0" }} />
                              <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: 700 }}>
                                {arrival}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Footer */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>Total</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange }}>
                          ₹{Number(order.total_amount || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {cfg.canCancel && (
                          <Button
                            size="small" variant="outlined" color="error"
                            startIcon={<CancelRoundedIcon fontSize="small" />}
                            onClick={() => { setCancelId(order.id); setReason(""); }}
                            sx={{ fontWeight: 600, fontSize: "0.78rem" }}
                          >
                            Cancel Order
                          </Button>
                        )}
                        {order.cancelled_at && (
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>
                            Cancelled {fmtDate(order.cancelled_at)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* Cancel dialog */}
      <Dialog open={!!cancelId} onClose={() => !cancelling && setCancelId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            This action cannot be undone. Please provide a reason (optional).
          </Typography>
          <TextField
            fullWidth size="small" label="Reason (optional)"
            value={reason} onChange={(e) => setReason(e.target.value)}
            multiline rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelId(null)} disabled={cancelling}>Keep Order</Button>
          <Button
            variant="contained" color="error" onClick={handleCancelConfirm} disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
