import { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Chip, Button, CircularProgress, Alert, Stack,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

const STATUSES = ["", "PLACED", "ACCEPTED", "PREPARING", "DELIVERED", "CANCELLED"];
const STATUS_COLORS = {
  PLACED: "info", ACCEPTED: "primary", PREPARING: "warning", DELIVERED: "success", CANCELLED: "default",
};

export default function AdminOrdersPage() {
  const [orders, setOrders]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [statusFilter, setStatus] = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState({});

  const load = useCallback(async (s) => {
    setLoading(true);
    try {
      const data = await adminService.getOrders({ status: s, limit: 50 });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch { setError("Failed to load orders."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(""); }, [load]);

  const handleStatusChange = (e) => { setStatus(e.target.value); load(e.target.value); };

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
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <ReceiptLongRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Orders</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{total} results</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={statusFilter} onChange={handleStatusChange} label="Filter by Status">
              <MenuItem value="">All Statuses</MenuItem>
              {STATUSES.filter(Boolean).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: brand.orange }} /></Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Placed</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Update Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 600 }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.customer_name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{o.customer_email}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: brand.orange }}>
                      ₹{Number(o.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={o.status} color={STATUS_COLORS[o.status] || "default"} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                      {new Date(o.created_at).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                        {["DELIVERED", "CANCELLED"].includes(o.status) ? (
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                        ) : (
                          STATUSES.filter(Boolean).filter((s) => s !== o.status).map((s) => (
                            <Button key={s} size="small" variant="outlined"
                              disabled={!!busy[o.id]}
                              onClick={() => updateStatus(o.id, s)}
                              sx={{ fontSize: "0.65rem", px: 0.75, py: 0.25, fontWeight: 600, minWidth: 0 }}>
                              {busy[o.id] ? <CircularProgress size={10} /> : s}
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
