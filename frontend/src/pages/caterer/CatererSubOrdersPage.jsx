import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Card, CardContent, Stack,
  Chip, Button, CircularProgress, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Snackbar,
} from "@mui/material";
import Inventory2RoundedIcon     from "@mui/icons-material/Inventory2Rounded";
import DinnerDiningRoundedIcon   from "@mui/icons-material/DinnerDiningRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import TwoWheelerRoundedIcon     from "@mui/icons-material/TwoWheelerRounded";
import masterOrderService from "../../services/masterOrderService";
import riderService from "../../services/riderService";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

const STATUS_CFG = {
  PLACED:            { label: "New Order",      color: "info",    actions: ["ACCEPTED", "CANCELLED"] },
  ACCEPTED:          { label: "Accepted",       color: "primary", actions: ["PREPARING", "CANCELLED"] },
  PREPARING:         { label: "Preparing",      color: "warning", actions: ["READY"] },
  READY:             { label: "Ready",          color: "success", actions: ["DELIVERED"] },
  ASSIGNED_TO_RIDER: { label: "Rider Assigned", color: "info",    actions: [] },
  OUT_FOR_DELIVERY:  { label: "Out for Delivery",color: "warning", actions: [] },
  DELIVERED:         { label: "Delivered",      color: "success", actions: [] },
  CANCELLED:         { label: "Cancelled",      color: "default", actions: [] },
};

const ACTION_LABELS = {
  ACCEPTED:  "Accept Order",
  PREPARING: "Start Preparing",
  READY:     "Ready For Delivery",
  DELIVERED: "Mark Delivered",
  CANCELLED: "Cancel",
};

const PAY_CFG = {
  PENDING:            { label: "Payment Pending",     color: "#F57F17" },
  PROOF_SUBMITTED:    { label: "Proof Received",      color: "#1565C0" },
  APPROVED:           { label: "Payment Approved",    color: "#2E7D32" },
  REJECTED:           { label: "Payment Rejected",    color: "#C62828" },
  REUPLOAD_REQUESTED: { label: "Re-upload Requested", color: "#E65100" },
};

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CatererSubOrdersPage() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [updating, setUpdating]   = useState({});
  const [snack, setSnack]         = useState({ open: false, message: "", severity: "success" });
  const [cancelDialog, setCancelDialog]   = useState({ open: false, id: null, reason: "" });
  const [assignDialog, setAssignDialog]   = useState({ open: false, orderId: null });
  const [riders, setRiders]               = useState([]);
  const [selectedRider, setSelectedRider] = useState("");
  const [assigning, setAssigning]         = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await masterOrderService.getCatererSubOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const openAssignDialog = async (orderId) => {
    setAssignDialog({ open: true, orderId });
    setSelectedRider("");
    try {
      const data = await riderService.listMyRiders();
      setRiders(Array.isArray(data) ? data.filter((r) => r.is_active) : []);
    } catch {
      setRiders([]);
    }
  };

  const handleAssignConfirm = async () => {
    if (!selectedRider) return;
    setAssigning(true);
    try {
      const updated = await riderService.assignRider(assignDialog.orderId, selectedRider);
      setOrders((prev) => prev.map((o) => o.id === assignDialog.orderId ? { ...o, ...updated } : o));
      setAssignDialog({ open: false, orderId: null });
      setSnack({ open: true, message: "Rider assigned successfully.", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to assign rider.", severity: "error" });
    } finally {
      setAssigning(false);
    }
  };

  const handleAction = async (orderId, status) => {
    if (status === "CANCELLED") {
      setCancelDialog({ open: true, id: orderId, reason: "" });
      return;
    }
    setUpdating((u) => ({ ...u, [orderId]: true }));
    try {
      const updated = await masterOrderService.updateCatererOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updated } : o));
      setSnack({ open: true, message: `Order marked as ${status.toLowerCase()}.`, severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to update order.", severity: "error" });
    } finally {
      setUpdating((u) => { const n = { ...u }; delete n[orderId]; return n; });
    }
  };

  const handleCancelConfirm = async () => {
    const { id, reason } = cancelDialog;
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      const updated = await masterOrderService.cancelCatererOrder(id, reason);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, ...updated } : o));
      setCancelDialog({ open: false, id: null, reason: "" });
      setSnack({ open: true, message: "Order cancelled.", severity: "info" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to cancel.", severity: "error" });
    } finally {
      setUpdating((u) => { const n = { ...u }; delete n[id]; return n; });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Inventory2RoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>My Orders</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Split orders assigned to you</Typography>
          </Box>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <Inventory2RoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No orders yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              New orders from customers will appear here.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => {
              const statusKey  = order.status || "PLACED";
              const cfg        = STATUS_CFG[statusKey] || { label: statusKey, color: "default", actions: [] };
              const payCfg     = PAY_CFG[order.payment_status] || PAY_CFG.PENDING;
              const items      = Array.isArray(order.items) ? order.items : [];
              const isUpdating = !!updating[order.id];

              return (
                <Card key={order.id} elevation={0} sx={{
                  border: `2px solid ${statusKey === "PLACED" ? brand.gold : brand.border}`,
                  transition: "border-color 0.2s",
                }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Customer: {order.customer_name} · {fmtDate(order.created_at)}
                        </Typography>
                      </Box>
                      <Stack spacing={0.5} alignItems="flex-end">
                        <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700 }} />
                        <Chip
                          label={payCfg.label}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.6rem", color: payCfg.color, border: `1px solid ${payCfg.color}`, backgroundColor: "transparent" }}
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                      {items.map((it, idx) => (
                        <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <Box sx={{
                            width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                            background: `linear-gradient(135deg, ${brand.greenLight}, #A5D6A7)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <DinnerDiningRoundedIcon sx={{ fontSize: 16, color: brand.orange, opacity: 0.7 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{it.food_name}</Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Qty: {it.quantity} × ₹{Number(it.unit_price || 0).toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            ₹{Number(it.total_price || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Divider sx={{ mb: 1.25 }} />

                    {statusKey === "PLACED" && (
                      <Box sx={{ p: 1, mb: 1.25, borderRadius: 1.5, backgroundColor: brand.goldLight, border: `1px solid ${brand.gold}` }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <HourglassEmptyRoundedIcon sx={{ fontSize: 14, color: "#B8860B" }} />
                          <Typography variant="caption" sx={{ color: "#B8860B", fontWeight: 700 }}>
                            New order waiting for your response
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange }}>
                        ₹{Number(order.subtotal || 0).toFixed(2)}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        {cfg.actions.length > 0 && cfg.actions.map((action) => (
                          <Button
                            key={action}
                            size="small"
                            variant={action === "CANCELLED" ? "outlined" : "contained"}
                            color={action === "CANCELLED" ? "error" : "primary"}
                            disabled={isUpdating}
                            onClick={() => handleAction(order.id, action)}
                            startIcon={isUpdating ? <CircularProgress size={12} color="inherit" /> : null}
                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                          >
                            {ACTION_LABELS[action] || action}
                          </Button>
                        ))}
                        {statusKey === "READY" && (
                          <Button
                            size="small" variant="outlined"
                            startIcon={<TwoWheelerRoundedIcon fontSize="small" />}
                            disabled={isUpdating}
                            onClick={() => openAssignDialog(order.id)}
                            sx={{ fontWeight: 600, fontSize: "0.75rem", color: brand.orange, borderColor: brand.orange }}
                          >
                            Assign Rider
                          </Button>
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

      {/* Assign Rider Dialog */}
      <Dialog open={assignDialog.open} onClose={() => !assigning && setAssignDialog({ open: false, orderId: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Rider to Order</DialogTitle>
        <DialogContent>
          {riders.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              No active riders found. Add riders in the My Riders page first.
            </Alert>
          ) : (
            <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
              <InputLabel>Select Rider</InputLabel>
              <Select
                label="Select Rider"
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
              >
                {riders.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}{r.vehicle_type ? ` · ${r.vehicle_type}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignDialog({ open: false, orderId: null })} disabled={assigning}>Cancel</Button>
          <Button
            variant="contained" onClick={handleAssignConfirm}
            disabled={assigning || !selectedRider}
            startIcon={assigning ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})` }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog((s) => ({ ...s, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel this order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Please provide a reason (optional).
          </Typography>
          <TextField
            fullWidth size="small" label="Reason (optional)"
            value={cancelDialog.reason}
            onChange={(e) => setCancelDialog((s) => ({ ...s, reason: e.target.value }))}
            multiline rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialog((s) => ({ ...s, open: false }))}>Keep</Button>
          <Button variant="contained" color="error" onClick={handleCancelConfirm}>Yes, Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
