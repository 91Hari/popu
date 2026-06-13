import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Grid, Card, CardContent, Typography,
  Button, Stack, Skeleton, Alert, Chip, Divider, List,
  ListItemButton, ListItemText, ListItemIcon,
} from "@mui/material";
import RestaurantMenuRoundedIcon       from "@mui/icons-material/RestaurantMenuRounded";
import ListAltRoundedIcon              from "@mui/icons-material/ListAltRounded";
import AttachMoneyRoundedIcon          from "@mui/icons-material/AttachMoneyRounded";
import AddCircleOutlineRoundedIcon     from "@mui/icons-material/AddCircleOutlineRounded";
import ReceiptLongRoundedIcon          from "@mui/icons-material/ReceiptLongRounded";
import ArrowForwardRoundedIcon         from "@mui/icons-material/ArrowForwardRounded";
import NotificationsNoneRoundedIcon    from "@mui/icons-material/NotificationsNoneRounded";
import FiberNewRoundedIcon             from "@mui/icons-material/FiberNewRounded";
import CheckCircleOutlineRoundedIcon   from "@mui/icons-material/CheckCircleOutlineRounded";
import SetMealRoundedIcon              from "@mui/icons-material/SetMealRounded";

import foodService                  from "../../services/foodService";
import masterOrderService           from "../../services/masterOrderService";
import catererService               from "../../services/catererService";
import catererNotifService          from "../../services/catererNotificationService";
import AppLayout                    from "../../components/AppLayout";
import WelcomeCard                  from "../../components/WelcomeCard";
import AvailabilityToggle           from "../../components/AvailabilityToggle";
import { brand } from "../../theme";

const STAT_CARDS = [
  { key: "foods",   label: "Total Foods",   hint: "Manage menu",    href: "/caterer/foods",  icon: <RestaurantMenuRoundedIcon sx={{ color: brand.orange, fontSize: 32 }} /> },
  { key: "orders",  label: "Total Orders",  hint: "View all orders", href: "/caterer/sub-orders", icon: <ListAltRoundedIcon sx={{ color: brand.orange, fontSize: 32 }} /> },
  { key: "revenue", label: "Revenue",       hint: "View orders",     href: "/caterer/sub-orders", prefix: "₹", icon: <AttachMoneyRoundedIcon sx={{ color: brand.orange, fontSize: 32 }} /> },
];

export default function CatererDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]             = useState({ foods: 0, orders: 0, revenue: 0 });
  const [welcomeStats, setWelcome]    = useState({ todayOrders: 0, totalFoods: 0, pendingOrders: 0 });
  const [availStatus, setAvailStatus] = useState("READY");
  const [availLoading, setAvailLoad]  = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [notifs, setNotifs]           = useState([]);
  const [notifsLoading, setNotifsLoad] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [allFoods, ordersData, availData] = await Promise.all([
        foodService.getFoods(),
        masterOrderService.getCatererSubOrders(),
        catererService.getMyAvailability(),
      ]);

      const myFoods   = (Array.isArray(allFoods) ? allFoods : []).filter((f) => f.caterer_id === user.id);
      const orders    = Array.isArray(ordersData) ? ordersData : (ordersData?.orders ?? []);
      const today     = new Date().toDateString();
      const todayOrd  = orders.filter((o) => new Date(o.created_at).toDateString() === today).length;
      const pending   = orders.filter((o) => o.status === "PLACED").length;
      let revenue     = 0;
      orders.filter((o) => o.status === "DELIVERED").forEach((o) => { revenue += Number(o.total_amount || 0); });

      setStats({ foods: myFoods.length, orders: orders.length, revenue: revenue.toFixed(2) });
      setWelcome({ todayOrders: todayOrd, totalFoods: myFoods.length, pendingOrders: pending });
      setAvailStatus(availData?.availability_status || "READY");
    } catch (err) {
      console.error(err);
      setStats({ foods: 0, orders: 0, revenue: "0.00" });
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchNotifs = useCallback(async () => {
    try {
      setNotifsLoad(true);
      const data = await catererNotifService.getNotifications();
      setNotifs((Array.isArray(data) ? data : []).slice(0, 5));
    } catch { /* silent */ }
    finally { setNotifsLoad(false); }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  const handleNotifClick = async (notif) => {
    try { await catererNotifService.markRead(notif.id); } catch { /* ignore */ }
    const dest = notif.reference_id
      ? `/caterer/sub-orders?highlight=${notif.reference_id}`
      : "/caterer/sub-orders";
    navigate(dest);
  };

  const handleAvailChange = async (newStatus) => {
    setAvailLoad(true);
    setError("");
    try {
      const data = await catererService.setMyAvailability(newStatus);
      setAvailStatus(data.availability_status || newStatus);
    } catch {
      setError("Failed to update availability. Please try again.");
    } finally {
      setAvailLoad(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

        {/* Welcome card */}
        <WelcomeCard
          catererName={user.name}
          availabilityStatus={availStatus}
          stats={welcomeStats}
          loading={loading}
        />

        {/* Availability toggle */}
        <Box sx={{ mb: 3 }}>
          <AvailabilityToggle
            status={availStatus}
            onChange={handleAvailChange}
            loading={availLoading}
          />
        </Box>

        {/* Stat cards */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Overview</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {STAT_CARDS.map((card) => (
            <Grid item xs={12} sm={4} key={card.key}>
              <Card
                onClick={() => navigate(card.href)}
                sx={{
                  height: "100%", borderLeft: `4px solid ${brand.orange}`,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.15s",
                  "&:hover": { boxShadow: "0 6px 20px rgba(27,94,32,0.18)", transform: "translateY(-2px)" },
                  "&:hover .stat-hint": { opacity: 1 },
                }}
              >
                <CardContent sx={{ pb: "12px !important" }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                    <Box sx={{
                      width: 52, height: 52, borderRadius: 2.5,
                      backgroundColor: brand.greenLight,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {card.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                        {card.label}
                      </Typography>
                      {loading
                        ? <Skeleton width={72} height={32} />
                        : <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                            {card.prefix || ""}{stats[card.key]}
                          </Typography>
                      }
                    </Box>
                  </Stack>
                  <Stack className="stat-hint" direction="row" alignItems="center" spacing={0.5}
                    sx={{ opacity: 0, transition: "opacity 0.2s", color: brand.orange }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: brand.orange }}>{card.hint}</Typography>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick actions */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="contained" size="large" startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => navigate("/caterer/add-food")}
            sx={{ background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`, fontWeight: 700, px: 3 }}>
            Add New Food
          </Button>
          <Button variant="outlined" size="large" startIcon={<RestaurantMenuRoundedIcon />}
            onClick={() => navigate("/caterer/foods")}
            sx={{ borderColor: brand.orange, color: brand.orange, fontWeight: 700, px: 3 }}>
            Manage Menu
          </Button>
          <Button variant="outlined" size="large" startIcon={<ReceiptLongRoundedIcon />}
            onClick={() => navigate("/caterer/sub-orders")}
            sx={{ borderColor: brand.orange, color: brand.orange, fontWeight: 700, px: 3 }}>
            View Orders
          </Button>
          <Button variant="outlined" size="large" startIcon={<SetMealRoundedIcon />}
            onClick={() => navigate("/caterer/tiffin")}
            sx={{ borderColor: brand.orange, color: brand.orange, fontWeight: 700, px: 3 }}>
            Tiffin Box
          </Button>
        </Stack>

        {/* Recent Notifications widget */}
        <Box sx={{ mt: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <NotificationsNoneRoundedIcon sx={{ color: brand.orange, fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Notifications</Typography>
            </Stack>
            <Button size="small" variant="text" onClick={() => navigate("/caterer/notifications")}
              sx={{ color: brand.orange, fontWeight: 600, textTransform: "none" }}>
              View all
            </Button>
          </Stack>

          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            {notifsLoading && notifs.length === 0 ? (
              <Box sx={{ p: 3 }}>
                {[1, 2].map((k) => <Skeleton key={k} height={48} sx={{ mb: 0.5 }} />)}
              </Box>
            ) : notifs.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 40, color: brand.border, mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>All caught up!</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {notifs.map((n, idx) => (
                  <Box key={n.id}>
                    <ListItemButton
                      onClick={() => handleNotifClick(n)}
                      sx={{
                        px: 2, py: 1.25,
                        backgroundColor: n.is_read ? "transparent" : brand.goldLight,
                        "&:hover": { backgroundColor: brand.greenLight },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <FiberNewRoundedIcon sx={{ color: n.is_read ? "text.disabled" : brand.orange, fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" sx={{ fontWeight: n.is_read ? 400 : 700 }} noWrap>
                              {n.title}
                            </Typography>
                            {!n.is_read && (
                              <Chip label="NEW" size="small"
                                sx={{ height: 16, fontSize: "0.62rem", fontWeight: 700,
                                  backgroundColor: brand.gold, color: brand.text, borderRadius: 1 }} />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                            {n.message}
                          </Typography>
                        }
                      />
                      <Typography variant="caption" sx={{ color: "text.disabled", ml: 1, whiteSpace: "nowrap" }}>
                        {new Date(n.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </Typography>
                    </ListItemButton>
                    {idx < notifs.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Card>
        </Box>
      </Container>
    </AppLayout>
  );
}
