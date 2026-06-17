import { useEffect, useRef, useState, useCallback } from "react";
import {
  Container, Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Chip, Button, CircularProgress, Alert, Stack,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

const STATUSES = [
  "", "PLACED", "ACCEPTED", "PREPARING", "READY",
  "ASSIGNED_TO_RIDER", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
];

const STATUS_COLORS = {
  PLACED:            "info",
  ACCEPTED:          "primary",
  PREPARING:         "warning",
  READY:             "secondary",
  ASSIGNED_TO_RIDER: "warning",
  OUT_FOR_DELIVERY:  "warning",
  DELIVERED:         "success",
  CANCELLED:         "default",
};

// Only show the logical next-step transitions for each status
const NEXT_STATUSES = {
  PLACED:            ["ACCEPTED", "CANCELLED"],
  ACCEPTED:          ["PREPARING", "CANCELLED"],
  PREPARING:         ["READY", "CANCELLED"],
  READY:             ["ASSIGNED_TO_RIDER", "CANCELLED"],
  ASSIGNED_TO_RIDER: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY:  ["DELIVERED", "CANCELLED"],
};

const POLL_MS = 15_000;

export default function AdminOrdersPage() {
  const [orders, setOrders]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [statusFilter, setStatus] = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState({});
  const pollRef                   = useRef(null);

  const load = useCallback(async (s, showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await adminService.getOrders({ status: s, limit: 50 });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch { setError("Failed to load orders."); }
    finally { if (showSpinner) setLoading(false); }
  }, []);

  useEffect(() => {
    load(statusFilter, true);
    pollRef.current = setInterval(() => load(statusFilter), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [load, statusFilter]);

  const handleStatusChange = (e) => setStatus(e.target.value);

  const updateStatus = async (id, newStatus) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await adminService.updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
    } catch { setError("Failed to update order."); }
    finally { setBusy((b) => { const n = { ...b }; delete n[id]; return n; }); }
  };

  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <ReceiptLongRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Orders</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{total} results · auto-refreshes every 15 s</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={statusFilter} onChange={handleStatusChange} label="Filter by Status">
              <MenuItem value="">All Statuses</MenuItem>
              {STATUSES.filter(Boolean).map((s) => <MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: brand.orange }} /></Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: brand.orangeLight }}>
                  <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Caterer</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Placed</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
                {orders.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 600 }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.customer_name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{o.customer_email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{o.caterer_name || "—"}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: brand.orange }}>
                      ₹{Number(o.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{o.payment_method || "—"}</Typography>
                        {o.payment_status && (
                          <Chip
                            label={o.payment_status}
                            size="small"
                            color={o.payment_status === "PAID" ? "success" : o.payment_status === "PENDING" ? "warning" : "default"}
                            sx={{ fontSize: "0.6rem", height: 16 }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={o.status.replace(/_/g, " ")}
                        color={STATUS_COLORS[o.status] || "default"}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: "0.65rem" }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                      {new Date(o.created_at).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                        {!NEXT_STATUSES[o.status] ? (
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                        ) : (
                          NEXT_STATUSES[o.status].map((s) => (
                            <Button key={s} size="small" variant="outlined"
                              disabled={!!busy[o.id]}
                              onClick={() => updateStatus(o.id, s)}
                              color={s === "CANCELLED" ? "error" : "primary"}
                              sx={{ fontSize: "0.6rem", px: 0.75, py: 0.25, fontWeight: 600, minWidth: 0, whiteSpace: "nowrap" }}>
                              {busy[o.id] ? <CircularProgress size={10} /> : s.replace(/_/g, " ")}
                            </Button>
                          ))
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </AppLayout>
  );
}
