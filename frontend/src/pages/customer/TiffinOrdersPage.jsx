import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack,
  Chip, Button, CircularProgress, Alert, Divider, Collapse,
} from "@mui/material";
import DiningIcon  from "@mui/icons-material/Dining";
import ExpandMoreRoundedIcon    from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon    from "@mui/icons-material/ExpandLessRounded";
import TodayRoundedIcon         from "@mui/icons-material/TodayRounded";
import DateRangeRoundedIcon     from "@mui/icons-material/DateRangeRounded";
import AppLayout                from "../../components/AppLayout";
import tiffinService            from "../../services/tiffinService";
import { brand }                from "../../theme";

const BOX_LABELS = {
  ONE_CARRIAGE:   "1 Carriage Box",
  TWO_CARRIAGE:   "2 Carriage Box",
  THREE_CARRIAGE: "3 Carriage Box",
};

const STATUS_CFG = {
  PLACED:    { label: "Placed",    color: "info"    },
  CONFIRMED: { label: "Confirmed", color: "primary" },
  PREPARING: { label: "Preparing", color: "warning" },
  DELIVERED: { label: "Delivered", color: "success" },
  CANCELLED: { label: "Cancelled", color: "default" },
};

const DAY_LABELS = {
  MONDAY:"Mon", TUESDAY:"Tue", WEDNESDAY:"Wed",
  THURSDAY:"Thu", FRIDAY:"Fri", SATURDAY:"Sat", SUNDAY:"Sun",
};

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TiffinOrdersPage() {
  const navigate = useNavigate();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [expanded, setExpanded] = useState(new Set());

  const load = useCallback(async () => {
    try {
      const data = await tiffinService.getMyOrders();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err?.message || "Failed to load tiffin orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (id) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <DiningIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>My Lunch Box Orders</Typography>
          </Box>
          <Button variant="contained" size="small" onClick={() => navigate("/services/tiffin-box")}
            sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
            + Order Lunch Box
          </Button>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <DiningIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No lunch box orders yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Your Lunch Box orders will appear here.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/services/tiffin-box")}>
              Order Now
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => {
              const isExpanded = expanded.has(order.id);
              const cfg = STATUS_CFG[order.status] || { label: order.status, color: "default" };

              return (
                <Card key={order.id} elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    {/* Header */}
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                      onClick={() => toggleExpand(order.id)}
                    >
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                          <Chip label="Lunch Box" size="small"
                            sx={{ backgroundColor: brand.orangeLight, color: brand.orange, fontWeight: 700, fontSize: "0.6rem" }} />
                          <Chip label={cfg.label} size="small" color={cfg.color}
                            sx={{ fontWeight: 600, fontSize: "0.6rem" }} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {fmtDate(order.created_at)} · {order.caterer_name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange }}>
                          ₹{Number(order.total_amount || 0).toFixed(2)}
                        </Typography>
                        {isExpanded ? <ExpandLessRoundedIcon sx={{ color: "text.secondary" }} /> : <ExpandMoreRoundedIcon sx={{ color: "text.secondary" }} />}
                      </Box>
                    </Box>

                    {/* Collapsed summary chips */}
                    {!isExpanded && (
                      <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                        <Chip
                          icon={order.service_type === "TODAY" ? <TodayRoundedIcon sx={{ fontSize: "14px !important" }} /> : <DateRangeRoundedIcon sx={{ fontSize: "14px !important" }} />}
                          label={order.service_type === "TODAY" ? "Today" : "Daily"}
                          size="small"
                          sx={{ fontSize: "0.62rem", fontWeight: 600 }}
                        />
                        <Chip label={BOX_LABELS[order.box_type] || order.box_type} size="small"
                          sx={{ backgroundColor: brand.orangeLight, color: brand.orange, fontSize: "0.62rem", fontWeight: 600 }} />
                      </Stack>
                    )}

                    {/* Expanded detail */}
                    <Collapse in={isExpanded}>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack spacing={1.25}>
                        <DetailRow label="Caterer"    value={order.caterer_name} />
                        <DetailRow label="Box Type"   value={BOX_LABELS[order.box_type] || order.box_type} />
                        <DetailRow label="Service"    value={order.service_type === "TODAY" ? "Today (one-time)" : "Daily Subscription"} />
                        {order.service_type === "DAILY" && Array.isArray(order.days) && order.days.length > 0 && (
                          <DetailRow label="Days" value={order.days.map((d) => DAY_LABELS[d] || d).join(", ")} />
                        )}

                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <Box>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 0.75 }}>
                              Food Items
                            </Typography>
                            <Stack spacing={0.5}>
                              {order.items.map((item, idx) => (
                                <Box key={item.id || idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{
                                    width: 22, height: 22, borderRadius: "50%", backgroundColor: brand.orange,
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                  }}>
                                    <Typography sx={{ color: "white", fontWeight: 900, fontSize: "0.6rem" }}>{idx + 1}</Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.food_name}</Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        <Divider />
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: brand.orange }}>
                            ₹{Number(order.total_amount).toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </AppLayout>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Typography variant="body2" sx={{ color: "text.secondary", flexShrink: 0, mr: 1 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>{value}</Typography>
    </Box>
  );
}
