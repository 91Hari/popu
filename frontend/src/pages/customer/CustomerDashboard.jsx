import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Badge,
  Grid,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { brand } from "../../theme";
import TopNav from "../../components/TopNav";
import FoodCard from "../../components/FoodCard";
import foodService from "../../services/foodService";

const CATEGORIES = [
  { icon: <RestaurantRoundedIcon sx={{ fontSize: 26, color: brand.orange }} />, label: "Catering",  to: "/services/catering" },
  { icon: <LunchDiningRoundedIcon sx={{ fontSize: 26, color: brand.orange }} />, label: "Tiffins",  to: "/services/tiffins" },
  { icon: <PeopleAltRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,   label: "Book Cook", to: "/services/book-cook" },
  { icon: <HomeRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,        label: "Home Food", to: "/services/home-food" },
  { icon: <SchoolRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,      label: "Training",  to: "/services/training" },
];

export default function CustomerDashboard() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();
  const firstName = (user.name || "there").split(" ")[0];

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const data = await foodService.getCustomerFoods();
        setFoods((data || []).slice(0, 12));
      } catch (err) {
        console.error("Failed to fetch foods:", err);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar /> {/* spacer for fixed AppBar */}

      <Container maxWidth="lg" sx={{ pt: 2.5, pb: 4 }}>
        {/* Greeting + location */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Hi, {firstName} 👋
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <LocationOnRoundedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Hyderabad
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" sx={{ display: { md: "none" } }}>
            <Badge color="primary" variant="dot">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
        </Box>

        {/* Search bar */}
        <Box
          onClick={() => navigate("/customer/search")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: brand.white,
            border: `1px solid ${brand.border}`,
            borderRadius: 6,
            px: 2,
            py: 1.5,
            mb: 3,
            cursor: "pointer",
            maxWidth: 600,
            "&:hover": { borderColor: brand.orange },
            transition: "border-color 0.15s",
          }}
        >
          <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Search for catering, tiffins, cooks…
          </Typography>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}
            >
              Healthy Food
              <br />
              For Every Occasion
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
              pure · fresh · trusted
            </Typography>
            <Button
              onClick={() => navigate("/services")}
              sx={{
                backgroundColor: "white",
                color: brand.orange,
                fontWeight: 700,
                px: 3,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
              }}
            >
              Explore Now
            </Button>
          </Box>
          <DinnerDiningRoundedIcon
            sx={{ fontSize: { xs: 60, md: 90 }, opacity: 0.25, display: { xs: "none", sm: "block" } }}
          />
        </Box>

        {/* Service categories */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          Our Services
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, md: 2 },
            mb: 3.5,
            overflowX: "auto",
            pb: 0.5,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {CATEGORIES.map((cat) => (
            <Box
              key={cat.label}
              onClick={() => navigate(cat.to)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.75,
                cursor: "pointer",
                flexShrink: 0,
                minWidth: { xs: 72, md: 90 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 56, md: 68 },
                  height: { xs: 56, md: 68 },
                  borderRadius: 3,
                  backgroundColor: brand.orangeLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.15s, transform 0.15s",
                  "&:hover": {
                    backgroundColor: "#fce4c8",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                {cat.icon}
              </Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, textAlign: "center", lineHeight: 1.2, fontSize: { md: "0.78rem" } }}
              >
                {cat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Recommended grid */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          Recommended For You
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : foods.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <DinnerDiningRoundedIcon sx={{ fontSize: 48, color: brand.border, mb: 1 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No food items available right now.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {foods.map((food) => (
              <Grid item key={food.foodId || food.id} xs={6} sm={4} md={3} lg={2}>
                <FoodCard
                  food={food}
                  onClick={() => navigate(`/customer/food/${food.foodId || food.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
