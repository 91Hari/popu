import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box, Container, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Button, Stack, Card, CardContent, CircularProgress,
  Alert, Divider, useTheme, useMediaQuery,
} from "@mui/material";
import ReceiptLongRoundedIcon        from "@mui/icons-material/ReceiptLongRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelOutlinedIcon            from "@mui/icons-material/CancelOutlined";
import LocalDiningRoundedIcon        from "@mui/icons-material/LocalDiningRounded";
import TaskAltRoundedIcon            from "@mui/icons-material/TaskAltRounded";
import TwoWheelerRoundedIcon         from "@mui/icons-material/TwoWheelerRounded";
import orderService from "../../services/orderService";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

const STATUS_MAP = {
  PLACED:    { label: "Placed",         color: "info" },
  ACCEPTED:  { label: "Accepted",       color: "primary" },
  PREPARING: { label: "Preparing",      color: "warning" },
  READY:     { label: "Out for Delivery", color: "success" },
  DELIVERED: { label: "Delivered",      color: "success" },
  CANCELLED: { label: "Cancelled",      color: "default" },
};

/**
 * Returns the action buttons a caterer can take for a given order status.
 * Mirrors backend VALID_TRANSITIONS.CATERER exactly:
 *   PLACED    → ACCEPTED | CANCELLED
 *   ACCEPTED  → PREPARING
 *   PREPARING → DELIVERED
 */
function getActions(status, orderId, busy, onAction) {
  const btn = (label, newStatus, icon, color, bg) => (
    <Button
      key={newStatus}
      variant={color === "error" ? "outlined" : "contained"}
      color={color === "error" ? "error" : undefined}
      size="small"
      startIcon={busy ? <CircularProgress size={12} color="inherit" /> : icon}
      disabled={!!busy}
      onClick={() => onAction(orderId, newStatus)}
      sx={{
        fontWeight: 600,
        fontSize: "0.75rem",
        ...(bg ? { backgroundColor: bg, "&:hover": { backgroundColor: bg, filter: "brightness(0.9)" } } : {}),
      }}
    >
      {busy === newStatus ? "…" : label}
    </Button>
  );

  switch (status) {
    case "PLACED":
      return [
        btn("Accept", "ACCEPTED",  <CheckCircleOutlineRoundedIcon />, null,    brand.green),
        btn("Reject", "CANCELLED", <CancelOutlinedIcon />,            "error", null),
      ];
    case "ACCEPTED":
      return [
        btn("Start Preparing", "PREPARING", <LocalDiningRoundedIcon />, null, brand.orange),
        btn("Cancel",          "CANCELLED", <CancelOutlinedIcon />,     "error", null),
      ];
    case "PREPARING":
      return [
        btn("Mark Ready",     "READY",     <TwoWheelerRoundedIcon />, null, "#1976d2"),
        btn("Cancel",         "CANCELLED", <CancelOutlinedIcon />,    "error", null),
      ];
    case "READY":
      return [
        btn("Mark Delivered", "DELIVERED", <TaskAltRoundedIcon />, null, brand.green),
      ];
    default:
      return null;
  }
}

export default function CatererOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState({});  // { [orderId]: newStatus }
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams]  = useSearchParams();
  const highlightId     = searchParams.get("highlight") || "";

  const fetchOrders = useCallback(async () => {
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

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleAction = useCallback(async (orderId, newStatus) => {
    const prev = orders.find((o) => o.id === orderId);
    if (!prev) return;

    setBusy((b) => ({ ...b, [orderId]: newStatus }));
    setError("");

    // optimistic update
    setOrders((all) => all.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      await orderService.updateOrderStatus(orderId, newStatus);
    } catch (err) {
      // revert on failure
      setOrders((all) => all.map((o) => o.id === orderId ? { ...o, status: prev.status } : o));
      setError(
        err?.message?.includes("Cannot transition")
          ? `Cannot change status: ${err.message}`
          : "Failed to update order status. Please try again."
      );
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[orderId]; return n; });
    }
  }, [orders]);

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

      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <ReceiptLongRoundedIcon sx={{ color: brand.orange, fontSize: 28 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: brand.orange }}>
              Incoming Orders
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Manage and track all customer orders.
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" onClose={() => setError("")} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {orders.length === 0 ? (
          <Card elevation={0} sx={{ p: 4, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <ReceiptLongRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No orders yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Incoming orders will appear here.</Typography>
          </Card>
        ) : isMobile ? (
          /* ─── Mobile cards ─── */
          <Stack spacing={2}>
            {orders.map((order) => {
              const orderId      = order.id;
              const items        = Array.isArray(order.items) ? order.items : [];
              const amount       = Number(order.total_amount || 0).toFixed(2);
              const statusKey    = order.status || "PLACED";
              const actions      = getActions(statusKey, orderId, busy[orderId], handleAction);
              const isHighlighted = highlightId && orderId === highlightId;

              return (
                <Card key={orderId} elevation={0} sx={{
                  border: isHighlighted ? `2px solid ${brand.orange}` : `1px solid ${brand.border}`,
                  backgroundColor: isHighlighted ? "#FFF3E0" : undefined,
                }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            #{orderId.slice(0, 8).toUpperCase()}
                          </Typography>
                          {isHighlighted && (
                            <Chip label="NEW" size="small"
                              sx={{ height: 16, fontSize: "0.62rem", fontWeight: 800,
                                backgroundColor: brand.orange, color: "#fff", borderRadius: 1 }} />
                          )}
                        </Stack>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </Typography>
                      </Box>
                      <Chip
                        label={STATUS_MAP[statusKey]?.label || statusKey}
                        color={STATUS_MAP[statusKey]?.color}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    <Divider sx={{ mb: 1 }} />

                    {items.map((it, i) => (
                      <Box key={i} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{it.food_name} × {it.quantity}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{Number(it.total_price || 0).toFixed(2)}</Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: 1 }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                        Total ₹{amount}
                      </Typography>
                      {actions && (
                        <Stack direction="row" spacing={0.75}>
                          {actions}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          /* ─── Desktop table ─── */
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: brand.orangeLight }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const orderId      = order.id;
                  const items        = Array.isArray(order.items) ? order.items : [];
                  const amount       = Number(order.total_amount || 0).toFixed(2);
                  const statusKey    = order.status || "PLACED";
                  const actions      = getActions(statusKey, orderId, busy[orderId], handleAction);
                  const isHighlighted = highlightId && orderId === highlightId;

                  return (
                    <TableRow
                      key={orderId}
                      hover
                      sx={isHighlighted ? {
                        backgroundColor: "#FFF3E0",
                        outline: `2px solid ${brand.orange}`,
                        outlineOffset: "-2px",
                      } : {}}
                    >
                      <TableCell sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: "0.8rem" }}>
                        #{orderId.slice(0, 8).toUpperCase()}
                        {isHighlighted && (
                          <Chip label="NEW" size="small"
                            sx={{ ml: 0.75, height: 16, fontSize: "0.62rem", fontWeight: 800,
                              backgroundColor: brand.orange, color: "#fff", borderRadius: 1 }} />
                        )}
                      </TableCell>

                      <TableCell>
                        {items.map((it, i) => (
                          <Box key={i}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {it.food_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Qty: {it.quantity} × ₹{Number(it.unit_price || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                      </TableCell>

                      <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                        {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </TableCell>

                      <TableCell align="right" sx={{ fontWeight: 700, color: brand.orange }}>
                        ₹{amount}
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={STATUS_MAP[statusKey]?.label || statusKey}
                          color={STATUS_MAP[statusKey]?.color}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        {actions ? (
                          <Stack direction="row" spacing={0.75} justifyContent="center">
                            {actions}
                          </Stack>
                        ) : (
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </AppLayout>
  );
}
