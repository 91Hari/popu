import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Chip, CircularProgress, Alert,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, Collapse, IconButton, Card, CardContent, Divider,
} from "@mui/material";
import Inventory2RoundedIcon  from "@mui/icons-material/Inventory2Rounded";
import ExpandMoreRoundedIcon  from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon  from "@mui/icons-material/ExpandLessRounded";
import masterOrderService from "../../services/masterOrderService";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

const STATUS_CFG = {
  PLACED:    { label: "Placed",           color: "info"    },
  ACCEPTED:  { label: "Accepted",         color: "primary" },
  PREPARING: { label: "Preparing",        color: "warning" },
  READY:     { label: "Out for Delivery", color: "success" },
  DELIVERED: { label: "Delivered",        color: "success" },
  CANCELLED: { label: "Cancelled",        color: "default" },
};

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminMasterOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState(null);

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
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Inventory2RoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>All Split Orders</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{orders.length} master orders</Typography>
          </Box>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Caterers</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Statuses</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const catererOrders = Array.isArray(order.caterer_orders) ? order.caterer_orders : [];
                  const isExpanded    = expanded === order.id;

                  return (
                    <>
                      <TableRow key={order.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: brand.orange }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>{order.customer_email}</Typography>
                        </TableCell>
                        <TableCell>{fmtDate(order.created_at)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          ₹{Number(order.total_amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">{catererOrders.length}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" useFlexGap>
                            {catererOrders.map((co) => {
                              const cfg = STATUS_CFG[co.status] || { label: co.status, color: "default" };
                              return (
                                <Chip key={co.id} label={cfg.label} color={cfg.color} size="small" sx={{ fontSize: "0.6rem", fontWeight: 600 }} />
                              );
                            })}
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => setExpanded(isExpanded ? null : order.id)}>
                            {isExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow key={`${order.id}-detail`}>
                          <TableCell colSpan={7} sx={{ py: 0, backgroundColor: "#FAFAFA" }}>
                            <Collapse in={isExpanded} timeout="auto">
                              <Box sx={{ px: 2, py: 1.5 }}>
                                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                  {catererOrders.map((co) => {
                                    const cfg    = STATUS_CFG[co.status] || { label: co.status, color: "default" };
                                    return (
                                      <Card key={co.id} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, minWidth: 200 }}>
                                        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{co.caterer_name}</Typography>
                                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                            #{co.id.slice(0, 8).toUpperCase()} · ₹{Number(co.subtotal || 0).toFixed(2)}
                                          </Typography>
                                          <Divider sx={{ my: 0.75 }} />
                                          <Stack direction="row" spacing={0.5}>
                                            <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontSize: "0.6rem", fontWeight: 700 }} />
                                            <Chip label={co.payment_status || "PENDING"} size="small" variant="outlined" sx={{ fontSize: "0.6rem" }} />
                                          </Stack>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </Stack>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </AppLayout>
  );
}
