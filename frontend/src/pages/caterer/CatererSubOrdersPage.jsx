import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack,
  Chip, Button, CircularProgress, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Snackbar,
} from "@mui/material";
import Inventory2RoundedIcon      from "@mui/icons-material/Inventory2Rounded";
import DinnerDiningRoundedIcon    from "@mui/icons-material/DinnerDiningRounded";
import HourglassEmptyRoundedIcon  from "@mui/icons-material/HourglassEmptyRounded";
import TwoWheelerRoundedIcon      from "@mui/icons-material/TwoWheelerRounded";
import VerifiedRoundedIcon        from "@mui/icons-material/VerifiedRounded";
import BlockRoundedIcon           from "@mui/icons-material/BlockRounded";
import ImageSearchRoundedIcon     from "@mui/icons-material/ImageSearchRounded";
import LocalAtmRoundedIcon        from "@mui/icons-material/LocalAtmRounded";
import CreditCardRoundedIcon      from "@mui/icons-material/CreditCardRounded";
import DirectionsWalkRoundedIcon  from "@mui/icons-material/DirectionsWalkRounded";
import QrCodeRoundedIcon          from "@mui/icons-material/QrCodeRounded";
import CheckCircleRoundedIcon     from "@mui/icons-material/CheckCircleRounded";
import masterOrderService  from "../../services/masterOrderService";
import riderService        from "../../services/riderService";
import paymentProofService from "../../services/paymentProofService";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

const STATUS_CFG = {
  PLACED:            { label: "New Order",       color: "info",    actions: ["ACCEPTED", "CANCELLED"] },
  ACCEPTED:          { label: "Accepted",        color: "primary", actions: ["PREPARING", "CANCELLED"] },
  PREPARING:         { label: "Preparing",       color: "warning", actions: ["READY"] },
  READY:             { label: "Ready",           color: "success", actions: ["DELIVERED"] },
  ASSIGNED_TO_RIDER: { label: "Rider Assigned",  color: "info",    actions: [] },
  OUT_FOR_DELIVERY:  { label: "Out for Delivery",color: "warning", actions: [] },
  DELIVERED:         { label: "Delivered",       color: "success", actions: [] },
  COLLECTED:         { label: "Collected",       color: "success", actions: [] },
  CANCELLED:         { label: "Cancelled",       color: "default", actions: [] },
  AUTO_CANCELLED:    { label: "Auto-Cancelled",  color: "error",   actions: [] },
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
  PAID:               { label: "Cash Collected",      color: "#2E7D32" },
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
  const [searchParams]            = useSearchParams();
  // Dashboard notification links pass ?highlight=<master_order_id>
  const highlightMasterId         = searchParams.get("highlight") || "";
  const cardRefs                  = useRef({});

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
  const [rejectDialog, setRejectDialog]   = useState({ open: false, proofId: null, orderId: null, reason: "" });
  const [proofReviewing, setProofReviewing] = useState({});
  const [proofPreview, setProofPreview]   = useState({ open: false, url: "" });
  const [pickupDialog, setPickupDialog]   = useState({ open: false, orderId: null, code: "" });
  const [verifying,    setVerifying]      = useState(false);

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

  // Poll every 15 s so new orders surface quickly without needing a manual refresh.
  useEffect(() => {
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [load]);

  // Auto-scroll to a highlighted order when the page is loaded from a notification link.
  useEffect(() => {
    if (!highlightMasterId || loading) return;
    const timer = setTimeout(() => {
      const el = cardRefs.current[highlightMasterId];
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(timer);
  }, [highlightMasterId, loading]);

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

  const handleApproveProof = async (orderId, proofId) => {
    setProofReviewing((p) => ({ ...p, [orderId]: "APPROVING" }));
    try {
      await paymentProofService.reviewProof(proofId, { status: "APPROVED" });
      setOrders((prev) => prev.map((o) =>
        o.id === orderId ? { ...o, payment_status: "APPROVED" } : o
      ));
      setSnack({ open: true, message: "Payment approved. Customer has been notified.", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to approve payment.", severity: "error" });
    } finally {
      setProofReviewing((p) => { const n = { ...p }; delete n[orderId]; return n; });
    }
  };

  const handleRejectConfirm = async () => {
    const { proofId, orderId, reason } = rejectDialog;
    setProofReviewing((p) => ({ ...p, [orderId]: "REJECTING" }));
    try {
      await paymentProofService.reviewProof(proofId, { status: "REJECTED", rejection_reason: reason });
      setOrders((prev) => prev.map((o) =>
        o.id === orderId ? { ...o, payment_status: "REJECTED" } : o
      ));
      setRejectDialog({ open: false, proofId: null, orderId: null, reason: "" });
      setSnack({ open: true, message: "Payment rejected. Customer will be asked to re-upload.", severity: "info" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to reject payment.", severity: "error" });
    } finally {
      setProofReviewing((p) => { const n = { ...p }; delete n[orderId]; return n; });
    }
  };

  const handleVerifyPickup = async () => {
    const { orderId, code } = pickupDialog;
    setVerifying(true);
    try {
      await masterOrderService.confirmPickup(orderId, code.toUpperCase().trim());
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "COLLECTED" } : o));
      setPickupDialog({ open: false, orderId: null, code: "" });
      setSnack({ open: true, message: "Order marked as collected!", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Invalid pickup code. Please try again.", severity: "error" });
    } finally {
      setVerifying(false);
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
              const statusKey      = order.status || "PLACED";
              const cfg            = STATUS_CFG[statusKey] || { label: statusKey, color: "default", actions: [] };
              const payCfg         = PAY_CFG[order.payment_status] || PAY_CFG.PENDING;
              const items          = Array.isArray(order.items) ? order.items : [];
              const isUpdating     = !!updating[order.id];
              const isCod          = order.payment_method === "COD";
              const isHighlighted  = highlightMasterId && order.master_order_id === highlightMasterId;

              return (
                <Card
                  key={order.id}
                  ref={(el) => { if (el) cardRefs.current[order.master_order_id] = el; }}
                  elevation={0}
                  sx={{
                    border: isHighlighted
                      ? `2px solid ${brand.orange}`
                      : `2px solid ${statusKey === "PLACED" ? brand.gold : brand.border}`,
                    backgroundColor: isHighlighted ? brand.orangeLight : undefined,
                    transition: "border-color 0.2s, background-color 0.3s",
                  }}
                >
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
                        {order.fulfillment_type === "SELF_PICKUP" ? (
                          <Chip
                            icon={order.status === "COLLECTED"
                              ? <CheckCircleRoundedIcon sx={{ fontSize: "12px !important" }} />
                              : <DirectionsWalkRoundedIcon sx={{ fontSize: "12px !important" }} />}
                            label={order.status === "COLLECTED" ? "Collected" : "Self Pickup"}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: "0.6rem", backgroundColor: "#E8F5E9", color: "#2E7D32" }}
                          />
                        ) : (
                          <>
                            <Chip
                              label={payCfg.label}
                              size="small"
                              sx={{ fontWeight: 600, fontSize: "0.6rem", color: payCfg.color, border: `1px solid ${payCfg.color}`, backgroundColor: "transparent" }}
                              variant="outlined"
                            />
                            <Chip
                              icon={isCod
                                ? <LocalAtmRoundedIcon sx={{ fontSize: "12px !important" }} />
                                : <CreditCardRoundedIcon sx={{ fontSize: "12px !important" }} />}
                              label={isCod ? "Cash on Delivery" : "Online"}
                              size="small"
                              sx={{
                                fontWeight: 700, fontSize: "0.6rem",
                                backgroundColor: isCod ? "#E8F5E9" : "#EDE9FE",
                                color: isCod ? "#2E7D32" : "#5A4EE8",
                              }}
                            />
                          </>
                        )}
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

                    {/* COD info banner */}
                    {isCod && (
                      <Box sx={{ mb: 1.25, p: 1, borderRadius: 1.5, backgroundColor: "#E8F5E9", border: "1px solid #A5D6A7", display: "flex", alignItems: "center", gap: 1 }}>
                        <LocalAtmRoundedIcon sx={{ fontSize: 16, color: "#2E7D32", flexShrink: 0 }} />
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#2E7D32", display: "block" }}>
                            Cash on Delivery
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#2E7D32" }}>
                            {order.payment_status === "PAID"
                              ? "Cash collected by rider."
                              : "Rider will collect cash and show your QR code to customer."}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* UPI payment reference — shown for PLACED online orders before acceptance */}
                    {!isCod && statusKey === "PLACED" && (order.caterer_upi_id || order.caterer_phonepe_id) && (
                      <Box sx={{ mb: 1.25, p: 1, borderRadius: 1.5, backgroundColor: "#f3f0ff", border: "1px solid #d8d0f7" }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#5A4EE8", display: "block", mb: 0.25 }}>
                          Customer should pay to your UPI
                        </Typography>
                        <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem", color: "#3D2EA0" }}>
                          {order.caterer_phonepe_id || order.caterer_upi_id}
                        </Typography>
                        {order.caterer_payment_name && (
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {order.caterer_payment_name}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Payment screenshot — shown whenever available (any status) */}
                    {order.proof_screenshot_url && order.payment_status !== "PROOF_SUBMITTED" && (
                      <Box sx={{ mb: 1.25, p: 1, borderRadius: 1.5, backgroundColor: "#F1F8F1", border: "1px solid #A5D6A7", display: "flex", gap: 1.25, alignItems: "center" }}>
                        <Box
                          onClick={() => setProofPreview({ open: true, url: order.proof_screenshot_url })}
                          sx={{
                            width: 56, height: 56, borderRadius: 1.5, border: "1px solid #A5D6A7",
                            cursor: "pointer", flexShrink: 0, backgroundColor: "#C8E6C9",
                            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                          }}
                        >
                          {order.proof_screenshot_url.startsWith("data:image") ? (
                            <Box component="img" src={order.proof_screenshot_url} alt="Payment proof"
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <ImageSearchRoundedIcon sx={{ color: "#2E7D32" }} />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#2E7D32", display: "block" }}>
                            Payment Screenshot
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Tap to view full size
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Payment proof review block */}
                    {order.payment_status === "PROOF_SUBMITTED" && order.proof_id && (
                      <Box sx={{ mb: 1.25, p: 1.25, borderRadius: 1.5, backgroundColor: "#E3F2FD", border: "1px solid #90CAF9" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                          <ImageSearchRoundedIcon sx={{ fontSize: 16, color: "#1565C0" }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#1565C0" }}>
                            Payment Proof Received — Please Review
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                          {/* Proof thumbnail */}
                          {order.proof_screenshot_url && (
                            <Box
                              onClick={() => setProofPreview({ open: true, url: order.proof_screenshot_url })}
                              sx={{
                                width: 64, height: 64,
                                borderRadius: 1.5, border: "1px solid #90CAF9",
                                cursor: "pointer", flexShrink: 0,
                                backgroundColor: "#BBDEFB",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              {order.proof_screenshot_url.startsWith("data:image") ? (
                                <Box
                                  component="img"
                                  src={order.proof_screenshot_url}
                                  alt="Payment proof"
                                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <ImageSearchRoundedIcon sx={{ color: "#1565C0" }} />
                              )}
                            </Box>
                          )}
                          <Stack spacing={0.75} sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Customer uploaded payment proof. Verify and approve or reject.
                            </Typography>
                            <Stack direction="row" spacing={0.75}>
                              <Button
                                size="small" variant="contained"
                                startIcon={proofReviewing[order.id] === "APPROVING" ? <CircularProgress size={12} color="inherit" /> : <VerifiedRoundedIcon fontSize="small" />}
                                disabled={!!proofReviewing[order.id]}
                                onClick={() => handleApproveProof(order.id, order.proof_id)}
                                sx={{ fontWeight: 700, fontSize: "0.72rem", backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#1B5E20" } }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small" variant="outlined" color="error"
                                startIcon={proofReviewing[order.id] === "REJECTING" ? <CircularProgress size={12} color="inherit" /> : <BlockRoundedIcon fontSize="small" />}
                                disabled={!!proofReviewing[order.id]}
                                onClick={() => setRejectDialog({ open: true, proofId: order.proof_id, orderId: order.id, reason: "" })}
                                sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                              >
                                Reject
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      </Box>
                    )}

                    {order.payment_status === "REJECTED" && (
                      <Box sx={{ mb: 1.25, p: 1, borderRadius: 1.5, backgroundColor: "#FFEBEE", border: "1px solid #EF9A9A" }}>
                        <Typography variant="caption" sx={{ color: "#C62828", fontWeight: 700 }}>
                          Payment proof rejected — awaiting customer re-upload
                        </Typography>
                      </Box>
                    )}

                    {statusKey === "PLACED" && order.payment_status !== "PROOF_SUBMITTED" && (
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
                        {cfg.actions
                          .filter((a) => !(order.fulfillment_type === "SELF_PICKUP" && a === "DELIVERED"))
                          .map((action) => (
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
                        {statusKey === "READY" && order.fulfillment_type === "SELF_PICKUP" && (
                          <Button
                            size="small" variant="contained"
                            startIcon={<QrCodeRoundedIcon fontSize="small" />}
                            disabled={isUpdating}
                            onClick={() => setPickupDialog({ open: true, orderId: order.id, code: "" })}
                            sx={{ fontWeight: 700, fontSize: "0.75rem", backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#1B5E20" } }}
                          >
                            Verify Pickup Code
                          </Button>
                        )}
                        {statusKey === "READY" && order.fulfillment_type !== "SELF_PICKUP" && (
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

      {/* Reject proof dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog((s) => ({ ...s, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Payment Proof?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            The customer will be notified and can re-upload. Provide a reason (optional).
          </Typography>
          <TextField
            fullWidth size="small" label="Rejection reason (optional)"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog((s) => ({ ...s, reason: e.target.value }))}
            multiline rows={2}
            placeholder="e.g. Amount unclear, wrong screenshot…"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog((s) => ({ ...s, open: false }))}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm}>Reject Proof</Button>
        </DialogActions>
      </Dialog>

      {/* Proof image preview dialog */}
      <Dialog open={proofPreview.open} onClose={() => setProofPreview({ open: false, url: "" })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Payment Proof
          <Button size="small" onClick={() => setProofPreview({ open: false, url: "" })}>Close</Button>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          {proofPreview.url.startsWith("data:image") ? (
            <Box component="img" src={proofPreview.url} alt="Payment proof"
              sx={{ maxWidth: "100%", maxHeight: 500, borderRadius: 2, objectFit: "contain" }} />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              PDF proof — cannot preview inline.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Pickup Code Dialog */}
      <Dialog open={pickupDialog.open} onClose={() => !verifying && setPickupDialog({ open: false, orderId: null, code: "" })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Verify Customer Pickup Code</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Ask the customer for their 6-character pickup code and enter it below to confirm collection.
          </Typography>
          <TextField
            fullWidth size="small" label="Pickup Code"
            value={pickupDialog.code}
            onChange={(e) => setPickupDialog((s) => ({ ...s, code: e.target.value.toUpperCase().slice(0, 6) }))}
            inputProps={{ style: { fontFamily: "monospace", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "0.25em", textAlign: "center" } }}
            placeholder="A B C D E F"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPickupDialog({ open: false, orderId: null, code: "" })} disabled={verifying}>Cancel</Button>
          <Button
            variant="contained"
            disabled={verifying || pickupDialog.code.length < 6}
            onClick={handleVerifyPickup}
            startIcon={verifying ? <CircularProgress size={14} color="inherit" /> : <CheckCircleRoundedIcon fontSize="small" />}
            sx={{ fontWeight: 700, backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#1B5E20" } }}
          >
            Confirm Collection
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
