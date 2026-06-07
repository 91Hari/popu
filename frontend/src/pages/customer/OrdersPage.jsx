import { useEffect, useState, useMemo } from "react";
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
  Card,
  CardContent,
  Stack,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import orderService from "../../services/orderService";
import TopNav from "../../components/TopNav";
import { brand } from "../../theme";

const STATUS_MAP = {
  placed: { label: "Placed", color: "info" },
  preparing: { label: "Preparing", color: "warning" },
  delivered: { label: "Delivered", color: "success" },
};

export default function OrdersPage() {
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

  const rows = useMemo(() => {
    const out = [];
    (orders || []).forEach((order) => {
      const orderNumber =
        order.orderNumber ||
        order.id ||
        order._id ||
        `#${Math.floor(Math.random() * 100000)}`;
      const statusRaw = (order.status || "placed").toString().toLowerCase();
      const status = STATUS_MAP[statusRaw] ? statusRaw : "placed";

      const items = Array.isArray(order.items) ? order.items : [];
      if (items.length === 0) {
        out.push({ orderNumber, foodName: "(no items)", quantity: 0, price: 0, status });
      } else {
        items.forEach((it) => {
          out.push({
            orderNumber,
            foodName: it.name || it.foodName || "Item",
            quantity: Number(it.quantity || it.qty || 1),
            price: Number(it.price || it.unitPrice || 0),
            status,
          });
        });
      }
    });
    return out;
  }, [orders]);

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
          <Inventory2RoundedIcon sx={{ color: brand.orange, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            My Bookings
          </Typography>
        </Box>

        {error ? (
          <Paper sx={{ p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : rows.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center" }}>
            <Inventory2RoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              No orders yet
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Your orders will appear here once placed.
            </Typography>
          </Card>
        ) : isMobile ? (
          <Stack spacing={2}>
            {orders.map((order) => {
              const orderNumber = order.orderNumber || order.id || order._id || `#${Math.floor(Math.random() * 100000)}`;
              const statusRaw = (order.status || "placed").toString().toLowerCase();
              const statusKey = STATUS_MAP[statusRaw] ? statusRaw : "placed";
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <Card key={orderNumber} elevation={0}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {orderNumber}
                      </Typography>
                      <Chip
                        label={STATUS_MAP[statusKey].label}
                        color={STATUS_MAP[statusKey].color}
                        size="small"
                      />
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    {items.length === 0 ? (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        No items
                      </Typography>
                    ) : (
                      items.map((it, idx) => (
                        <Box key={idx} sx={{ my: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {it.name || it.foodName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Qty: {it.quantity || it.qty || 1}
                              </Typography>
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              ₹{Number(it.price || it.unitPrice || 0)}
                            </Typography>
                          </Stack>
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
            <Table>
              <TableHead sx={{ backgroundColor: brand.orangeLight }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Food Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={`${r.orderNumber}-${idx}`} hover>
                    <TableCell>{r.orderNumber}</TableCell>
                    <TableCell>{r.foodName}</TableCell>
                    <TableCell align="center">{r.quantity}</TableCell>
                    <TableCell align="right">₹{r.price}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={STATUS_MAP[r.status].label}
                        color={STATUS_MAP[r.status].color}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
