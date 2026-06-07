import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Skeleton,
} from "@mui/material";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import foodService from "../../services/foodService";
import orderService from "../../services/orderService";
import TopNav from "../../components/TopNav";
import { brand } from "../../theme";

const STAT_CARDS = [
  {
    key: "foods",
    label: "Total Foods",
    icon: <RestaurantMenuRoundedIcon sx={{ color: brand.orange, fontSize: 36 }} />,
  },
  {
    key: "orders",
    label: "Total Orders",
    icon: <ListAltRoundedIcon sx={{ color: brand.orange, fontSize: 36 }} />,
  },
  {
    key: "revenue",
    label: "Revenue",
    prefix: "₹",
    icon: <AttachMoneyRoundedIcon sx={{ color: brand.orange, fontSize: 36 }} />,
  },
];

export default function CatererDashboard() {
  const [stats, setStats] = useState({ foods: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const foods = await foodService.getFoods();
        const orders = await orderService.getOrders();

        const totalFoods = Array.isArray(foods) ? foods.length : 0;
        const totalOrders = Array.isArray(orders) ? orders.length : 0;

        let revenue = 0;
        if (Array.isArray(orders)) {
          orders.forEach((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            items.forEach((it) => {
              revenue += Number(it.quantity || it.qty || 1) * Number(it.price || it.unitPrice || 0);
            });
          });
        }

        setStats({ foods: totalFoods, orders: totalOrders, revenue });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setStats({ foods: 0, orders: 0, revenue: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: brand.orange, mb: 0.5 }}>
          Caterer Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Manage your food menu, track orders and revenue.
        </Typography>

        {/* Stat cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {STAT_CARDS.map((card) => (
            <Grid item xs={12} sm={4} key={card.key}>
              <Card
                sx={{
                  height: "100%",
                  borderLeft: `4px solid ${brand.orange}`,
                  "&:hover": { boxShadow: "0 4px 16px rgba(232,117,26,0.12)" },
                  transition: "box-shadow 0.2s",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        backgroundColor: brand.orangeLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                        {card.label}
                      </Typography>
                      {loading ? (
                        <Skeleton width={80} height={32} />
                      ) : (
                        <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                          {card.prefix || ""}{stats[card.key]}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick actions */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Quick Actions
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircleOutlineRoundedIcon />}
            sx={{
              background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
              fontWeight: 700,
              px: 3,
            }}
            onClick={() => navigate("/caterer/add-food")}
          >
            Add New Food
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<RestaurantMenuRoundedIcon />}
            onClick={() => navigate("/caterer/foods")}
            sx={{ borderColor: brand.orange, color: brand.orange, fontWeight: 700, px: 3 }}
          >
            Manage Menu
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ReceiptLongRoundedIcon />}
            onClick={() => navigate("/caterer/orders")}
            sx={{ borderColor: brand.orange, color: brand.orange, fontWeight: 700, px: 3 }}
          >
            View Orders
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
