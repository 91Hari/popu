import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, CircularProgress, Grid,
} from "@mui/material";
import RestaurantRoundedIcon    from "@mui/icons-material/RestaurantRounded";
import LunchDiningRoundedIcon   from "@mui/icons-material/LunchDiningRounded";
import PeopleAltRoundedIcon     from "@mui/icons-material/PeopleAltRounded";
import HomeRoundedIcon          from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon        from "@mui/icons-material/SchoolRounded";
import DinnerDiningRoundedIcon  from "@mui/icons-material/DinnerDiningRounded";
import RocketLaunchRoundedIcon  from "@mui/icons-material/RocketLaunchRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import FoodCard from "../../components/FoodCard";
import SearchSuggestions from "../../components/SearchSuggestions";
import foodService from "../../services/foodService";
import { useCustomerGeo } from "../../utils/geoUtils";

const CATEGORIES = [
  { icon: <RestaurantRoundedIcon sx={{ fontSize: 26, color: brand.orange }} />,  label: "Catering",  to: "/services/catering" },
  { icon: <LunchDiningRoundedIcon sx={{ fontSize: 26, color: brand.orange }} />, label: "Food",      to: "/services/food-marketplace" },
  { icon: <PeopleAltRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,    label: "Book Cook", to: "/services/book-cook" },
  { icon: <HomeRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,         label: "Home Food", to: "/services/home-food" },
  { icon: <SchoolRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,       label: "Training",  to: "/services/training" },
];

export default function CustomerDashboard() {
  const [foods, setFoods]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const customerCoords        = useCustomerGeo();

  useEffect(() => { console.log("[Diag] CustomerDashboard mounted"); }, []);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
  })();
  const firstName = (user.name || "there").split(" ")[0];

  const fetchFoods = useCallback(async (coords) => {
    try {
      setLoading(true);
      const geo  = coords || customerCoords;
      const data = await foodService.getCustomerFoods({ customerLat: geo?.lat, customerLng: geo?.lng });
      setFoods((data || []).slice(0, 12));
    } catch {
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [customerCoords]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 2.5, pb: 4 }}>
        {/* Greeting */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Hi, {firstName}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            What would you like today?
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3, maxWidth: 600 }}>
          <SearchSuggestions placeholder="Search for catering, tiffins, cooks…" fullWidth />
        </Box>

        {/* Hero banner */}
        <Box
          sx={{
            backgroundColor: brand.orange,
            color: "white",
            borderRadius: 4,
            p: { xs: 2.5, md: 4 },
            mb: 3.5,
            backgroundImage: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            overflow: "hidden", position: "relative",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
              Healthy Food<br />For Every Occasion
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>pure · fresh · trusted</Typography>
            <Button
              onClick={() => navigate("/services")}
              startIcon={<RocketLaunchRoundedIcon />}
              sx={{
                backgroundColor: "white", color: brand.orange, fontWeight: 700, px: 3,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
              }}
            >
              Explore Now
            </Button>
          </Box>
          <DinnerDiningRoundedIcon
            sx={{ fontSize: { xs: 60, md: 100 }, opacity: 0.18, display: { xs: "none", sm: "block" }, flexShrink: 0 }}
          />
        </Box>

        {/* Service categories */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>Our Services</Typography>
        <Box
          sx={{
            display: "flex", gap: { xs: 1, md: 2 }, mb: 3.5,
            overflowX: "auto", pb: 0.5,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {CATEGORIES.map((cat) => (
            <Box
              key={cat.label}
              onClick={() => navigate(cat.to)}
              sx={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 0.75, cursor: "pointer", flexShrink: 0,
                minWidth: { xs: 72, md: 90 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 56, md: 68 }, height: { xs: 56, md: 68 },
                  borderRadius: 3, backgroundColor: brand.orangeLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background-color 0.15s, transform 0.15s",
                  "&:hover": { backgroundColor: brand.greenLight, transform: "translateY(-3px)" },
                }}
              >
                {cat.icon}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600, textAlign: "center", lineHeight: 1.2, fontSize: { md: "0.78rem" } }}>
                {cat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Recommended */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>Recommended For You</Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : foods.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <DinnerDiningRoundedIcon sx={{ fontSize: 48, color: brand.border, mb: 1 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>No food items available right now.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {foods.map((food) => (
              <Grid item key={food.foodId || food.id} xs={6} sm={4} md={3} lg={3}>
                <FoodCard
                  food={food}
                  onClick={() => navigate(`/customer/food/${food.foodId || food.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </AppLayout>
  );
}
