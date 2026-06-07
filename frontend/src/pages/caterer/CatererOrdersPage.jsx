import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Toolbar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import orderService from "../../services/orderService";
import TopNav from "../../components/TopNav";
import { brand } from "../../theme";

const STATUS_MAP = {
  placed: { label: "Placed", color: "info" },
  preparing: { label: "Preparing", color: "warning" },
  delivered: { label: "Delivered", color: "success" },
  rejected: { label: "Rejected", color: "default" },
};

export default function CatererOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(err?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o,
      ),
    );
    try {
      if (orderService && typeof orderService.updateOrder === "function") {
        await orderService.updateOrder(orderId, { status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      setError("Failed to update order status.");
    }
  };

  const handleAccept = (id) => updateOrderStatus(id, "preparing");
  const handleReject = (id) => updateOrderStatus(id, "rejected");
  const handleComplete = (id) => updateOrderStatus(id, "delivered");

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

      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <ReceiptLongRoundedIcon sx={{ color: brand.orange, fontSize: 28 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: brand.orange }}>
              Incoming Orders
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Accept, reject or mark orders as delivered.
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Card elevation={0} sx={{ p: 4, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <ReceiptLongRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              No orders yet
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Incoming orders will appear here.
            </Typography>
          </Card>
        ) : isMobile ? (
          <Stack spacing={2}>
            {orders.map((order) => {
              const orderId = order.id || order.orderNumber;
              const firstItem = (order.items && order.items[0]) || {};
              const qty = Number(firstItem.quantity || firstItem.qty || 0);
              const price = Number(firstItem.price || firstItem.unitPrice || 0);
              const amount = order.total ?? order.amount ?? qty * price;
              const statusKey = order.status || "placed";

              return (
                <Card key={orderId} elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {order.orderNumber || order.id}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {firstItem.name || firstItem.foodName || "-"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Qty: {qty}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: brand.orange }}>
                          ₹{amount}
                        </Typography>
                        <Chip
                          label={STATUS_MAP[statusKey]?.label || statusKey}
                          color={STATUS_MAP[statusKey]?.color}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircleOutlineRoundedIcon />}
                        sx={{ backgroundColor: brand.green, fontWeight: 600 }}
                        onClick={() => handleAccept(orderId)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelOutlinedIcon />}
                        sx={{ fontWeight: 600 }}
                        onClick={() => handleReject(orderId)}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<TaskAltRoundedIcon />}
                        sx={{ backgroundColor: "#1976d2", fontWeight: 600 }}
                        onClick={() => handleComplete(orderId)}
                      >
                        Done
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: brand.orangeLight }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Food Item</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const orderId = order.id || order.orderNumber;
                  const firstItem = (order.items && order.items[0]) || {};
                  const qty = Number(firstItem.quantity || firstItem.qty || 0);
                  const price = Number(firstItem.price || firstItem.unitPrice || 0);
                  const amount = order.total ?? order.amount ?? qty * price;
                  const statusKey = order.status || "placed";

                  return (
                    <TableRow key={orderId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber || order.id}</TableCell>
                      <TableCell>{firstItem.name || firstItem.foodName || "-"}</TableCell>
                      <TableCell align="center">{qty}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: brand.orange }}>
                        ₹{amount}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={STATUS_MAP[statusKey]?.label || statusKey}
                          color={STATUS_MAP[statusKey]?.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.75} justifyContent="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircleOutlineRoundedIcon />}
                            sx={{ backgroundColor: brand.green, fontWeight: 600 }}
                            onClick={() => handleAccept(orderId)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelOutlinedIcon />}
                            sx={{ fontWeight: 600 }}
                            onClick={() => handleReject(orderId)}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<TaskAltRoundedIcon />}
                            sx={{ backgroundColor: "#1976d2", fontWeight: 600 }}
                            onClick={() => handleComplete(orderId)}
                          >
                            Complete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
