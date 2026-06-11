import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack,
  Chip, Button, CircularProgress, Alert, Divider, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar,
} from "@mui/material";
import Inventory2RoundedIcon     from "@mui/icons-material/Inventory2Rounded";
import ExpandMoreRoundedIcon     from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon     from "@mui/icons-material/ExpandLessRounded";
import UploadFileRoundedIcon     from "@mui/icons-material/UploadFileRounded";
import CancelRoundedIcon         from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import DinnerDiningRoundedIcon   from "@mui/icons-material/DinnerDiningRounded";
import TwoWheelerRoundedIcon     from "@mui/icons-material/TwoWheelerRounded";
import LockRoundedIcon           from "@mui/icons-material/LockRounded";
import masterOrderService from "../../services/masterOrderService";
import paymentProofService from "../../services/paymentProofService";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

const STATUS_CFG = {
  PLACED:            { label: "Placed",           color: "info"    },
  ACCEPTED:          { label: "Accepted",         color: "primary" },
  PREPARING:         { label: "Preparing",        color: "warning" },
  READY:             { label: "Ready",            color: "success" },
  ASSIGNED_TO_RIDER: { label: "Rider Assigned",   color: "info"    },
  OUT_FOR_DELIVERY:  { label: "Out for Delivery", color: "warning" },
  DELIVERED:         { label: "Delivered",        color: "success" },
  CANCELLED:         { label: "Cancelled",        color: "default" },
};

const PAY_CFG = {
  PENDING:            { label: "Payment Pending",        color: "#F57F17", bg: "#FFF8E1" },
  PROOF_SUBMITTED:    { label: "Proof Submitted",        color: "#1565C0", bg: "#E3F2FD" },
  APPROVED:           { label: "Payment Approved",       color: "#2E7D32", bg: "#E8F5E9" },
  REJECTED:           { label: "Payment Rejected",       color: "#C62828", bg: "#FFEBEE" },
  REUPLOAD_REQUESTED: { label: "Re-upload Required",     color: "#E65100", bg: "#FFF3E0" },
};

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MasterOrdersPage() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [expandedOrders, setExpanded] = useState(new Set());
  const [cancelDialog, setCancelDialog] = useState({ open: false, catererOrderId: null, reason: "" });
  const [proofDialog, setProofDialog]   = useState({ open: false, catererOrderId: null, url: "", ref: "" });
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack]           = useState({ open: false, message: "", severity: "success" });

  const load = useCallback(async () => {
    try {
      const data = await masterOrderService.getMasterOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (location.state?.justPlaced) {
      setSnack({ open: true, message: "Order placed successfully!", severity: "success" });
    }
  }, [location.state]);

  const handleCancelConfirm = async () => {
    setSubmitting(true);
    try {
      await masterOrderService.cancelCatererOrder(cancelDialog.catererOrderId, cancelDialog.reason);
      setCancelDialog({ open: false, catererOrderId: null, reason: "" });
      setSnack({ open: true, message: "Order cancelled.", severity: "info" });
      await load();
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to cancel.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofSubmit = async () => {
    if (!proofDialog.url) return;
    setSubmitting(true);
    try {
      await paymentProofService.submitProof({
        caterer_order_id:       proofDialog.catererOrderId,
        payment_screenshot_url: proofDialog.url,
        upi_reference:          proofDialog.ref,
      });
      setProofDialog({ open: false, catererOrderId: null, url: "", ref: "" });
      setSnack({ open: true, message: "Payment proof submitted!", severity: "success" });
      await load();
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to submit proof.", severity: "error" });
    } finally {
      setSubmitting(false);
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
          <Typography variant="h5" sx={{ fontWeight: 800 }}>My Bookings</Typography>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <Inventory2RoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No bookings yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Your orders will appear here after checkout.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/services/food-marketplace")}>Browse Food</Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {orders.map((masterOrder) => {
              const catererOrders = Array.isArray(masterOrder.caterer_orders) ? masterOrder.caterer_orders : [];
              const isExpanded    = expandedOrders.has(masterOrder.id);

              return (
                <Card key={masterOrder.id} elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    {/* Master order header */}
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                      onClick={() => setExpanded((prev) => {
                        const next = new Set(prev);
                        isExpanded ? next.delete(masterOrder.id) : next.add(masterOrder.id);
                        return next;
                      })}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                          Order #{masterOrder.id.slice(0, 8).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {fmtDate(masterOrder.created_at)} · {catererOrders.length} caterer{catererOrders.length !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange }}>
                          ₹{Number(masterOrder.total_amount || 0).toFixed(2)}
                        </Typography>
                        {isExpanded ? <ExpandLessRoundedIcon sx={{ color: "text.secondary" }} /> : <ExpandMoreRoundedIcon sx={{ color: "text.secondary" }} />}
                      </Box>
                    </Box>

                    {/* Caterer status chips (collapsed view) */}
                    {!isExpanded && catererOrders.length > 0 && (
                      <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                        {catererOrders.map((co) => {
                          const cfg = STATUS_CFG[co.status] || { label: co.status, color: "default" };
                          return (
                            <Chip
                              key={co.id}
                              label={`${co.caterer_name}: ${cfg.label}`}
                              size="small"
                              color={cfg.color}
                              sx={{ fontSize: "0.65rem", fontWeight: 600 }}
                            />
                          );
                        })}
                      </Stack>
                    )}

                    {/* Expanded detail */}
                    <Collapse in={isExpanded}>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack spacing={2}>
                        {catererOrders.map((co) => {
                          const cfg     = STATUS_CFG[co.status] || { label: co.status, color: "default" };
                          const payCfg  = PAY_CFG[co.payment_status] || PAY_CFG.PENDING;
                          const canCancel   = ["PLACED", "ACCEPTED"].includes(co.status);
                          const needsProof  = ["PENDING", "REJECTED", "REUPLOAD_REQUESTED"].includes(co.payment_status);

                          return (
                            <Box key={co.id} sx={{ p: 1.5, border: `1px solid ${brand.border}`, borderRadius: 2 }}>
                              {/* Sub-order header */}
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{co.caterer_name}</Typography>
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    Sub-order #{co.id.slice(0, 8).toUpperCase()} · ₹{Number(co.subtotal || 0).toFixed(2)}
                                  </Typography>
                                </Box>
                                <Stack spacing={0.5} alignItems="flex-end">
                                  <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                                  <Chip
                                    label={payCfg.label}
                                    size="small"
                                    sx={{ fontWeight: 600, fontSize: "0.6rem", backgroundColor: payCfg.bg, color: payCfg.color }}
                                  />
                                </Stack>
                              </Box>

                              {/* Item list */}
                              {Array.isArray(co.items) && co.items.length > 0 && (
                                <Box sx={{ mb: 1.25, pl: 0.5 }}>
                                  <Divider sx={{ mb: 1 }} />
                                  <Stack spacing={0.6}>
                                    {co.items.map((it, idx) => (
                                      <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{
                                          width: 28, height: 28, borderRadius: 1, flexShrink: 0,
                                          backgroundColor: brand.orangeLight,
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                          <DinnerDiningRoundedIcon sx={{ fontSize: 15, color: brand.orange }} />
                                        </Box>
                                        <Typography variant="caption" sx={{ flex: 1, fontWeight: 600 }}>
                                          {it.food_name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                                          {it.quantity} × ₹{Number(it.unit_price || 0).toFixed(0)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: brand.orange, whiteSpace: "nowrap", minWidth: 48, textAlign: "right" }}>
                                          ₹{Number(it.total_price || 0).toFixed(2)}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Stack>
                                  <Divider sx={{ mt: 1 }} />
                                </Box>
                              )}

                              {/* Delivery confirmation code — shown to customer so they can share with rider */}
                              {co.delivery_confirmation_code && ["ASSIGNED_TO_RIDER", "OUT_FOR_DELIVERY"].includes(co.status) && (
                                <Box sx={{ mb: 1.25, p: 1.25, borderRadius: 1.5, backgroundColor: "#FFF3E0", border: "1px solid #FFB74D" }}>
                                  <Stack direction="row" alignItems="center" gap={0.75}>
                                    <LockRoundedIcon sx={{ fontSize: 14, color: "#E65100" }} />
                                    <Box>
                                      <Typography variant="caption" sx={{ color: "#E65100", fontWeight: 700, display: "block" }}>
                                        Your Delivery Code
                                      </Typography>
                                      <Typography variant="h6" sx={{ color: "#E65100", fontWeight: 900, letterSpacing: "0.25em", lineHeight: 1.2 }}>
                                        {co.delivery_confirmation_code}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: "#E65100", opacity: 0.8 }}>
                                        Share this with your rider to confirm delivery
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Box>
                              )}

                              {co.status !== "CANCELLED" && (
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                                  {co.status === "OUT_FOR_DELIVERY" && co.rider_id && (
                                    <Chip
                                      icon={<TwoWheelerRoundedIcon fontSize="small" />}
                                      label="On the way to you!"
                                      size="small"
                                      sx={{ backgroundColor: "#FFF3E0", color: "#E65100", fontWeight: 700, fontSize: "0.7rem" }}
                                    />
                                  )}
                                  {needsProof && (
                                    <Button
                                      size="small" variant="outlined"
                                      startIcon={<UploadFileRoundedIcon fontSize="small" />}
                                      onClick={() => setProofDialog({ open: true, catererOrderId: co.id, url: "", ref: "" })}
                                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                                    >
                                      Upload Payment
                                    </Button>
                                  )}
                                  {co.payment_status === "APPROVED" && (
                                    <Chip
                                      icon={<CheckCircleRoundedIcon />}
                                      label="Payment Verified"
                                      size="small"
                                      sx={{ backgroundColor: "#E8F5E9", color: "#2E7D32", fontWeight: 700 }}
                                    />
                                  )}
                                  {canCancel && (
                                    <Button
                                      size="small" variant="outlined" color="error"
                                      startIcon={<CancelRoundedIcon fontSize="small" />}
                                      onClick={() => setCancelDialog({ open: true, catererOrderId: co.id, reason: "" })}
                                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </Stack>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => !submitting && setCancelDialog((s) => ({ ...s, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel this sub-order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            This cannot be undone. Provide a reason (optional).
          </Typography>
          <TextField
            fullWidth size="small" label="Reason (optional)"
            value={cancelDialog.reason}
            onChange={(e) => setCancelDialog((s) => ({ ...s, reason: e.target.value }))}
            multiline rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialog((s) => ({ ...s, open: false }))} disabled={submitting}>Keep</Button>
          <Button variant="contained" color="error" onClick={handleCancelConfirm} disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Proof Dialog */}
      <Dialog open={proofDialog.open} onClose={() => !submitting && setProofDialog((s) => ({ ...s, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Payment Proof</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              size="small" label="Screenshot URL *" placeholder="https://..."
              value={proofDialog.url}
              onChange={(e) => setProofDialog((s) => ({ ...s, url: e.target.value }))}
              fullWidth
            />
            <TextField
              size="small" label="UPI Transaction Reference (optional)"
              value={proofDialog.ref}
              onChange={(e) => setProofDialog((s) => ({ ...s, ref: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProofDialog((s) => ({ ...s, open: false }))} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained" onClick={handleProofSubmit}
            disabled={submitting || !proofDialog.url}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Submit Proof
          </Button>
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
