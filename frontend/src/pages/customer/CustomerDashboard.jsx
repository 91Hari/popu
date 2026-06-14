import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, CircularProgress, Chip,
} from "@mui/material";
import RestaurantRoundedIcon   from "@mui/icons-material/RestaurantRounded";
import LunchDiningRoundedIcon  from "@mui/icons-material/LunchDiningRounded";
import PeopleAltRoundedIcon    from "@mui/icons-material/PeopleAltRounded";
import HomeRoundedIcon         from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon       from "@mui/icons-material/SchoolRounded";
import BentoIcon               from "@mui/icons-material/Bento";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import FoodCard from "../../components/FoodCard";
import LatestFoodsCarousel from "../../components/LatestFoodsCarousel";
import SearchSuggestions from "../../components/SearchSuggestions";
import ComingSoonModal from "../../components/ComingSoonModal";
import foodService from "../../services/foodService";
import serviceConfigService from "../../services/serviceConfigService";
import { useCustomerGeo } from "../../utils/geoUtils";

const CARD_W = 200;

const CATEGORIES = [
  { serviceCode: "CATERING",    icon: <RestaurantRoundedIcon sx={{ fontSize: 26, color: brand.orange }} />,  label: "Catering",    to: "/services/catering" },
  { serviceCode: "FOOD",        icon: <LunchDiningRoundedIcon sx={{ fontSize: 26, color: brand.orange }} />, label: "Food",        to: "/services/food-marketplace" },
  { serviceCode: "LUNCH_BOX",   icon: <BentoIcon sx={{ fontSize: 26, color: brand.orange }} />,              label: "Lunch Box",   to: "/services/tiffin-box" },
  { serviceCode: "BOOK_A_COOK", icon: <PeopleAltRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,    label: "Book A Cook", to: "/services/book-cook" },
  { serviceCode: "HOME_FOOD",   icon: <HomeRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,         label: "Home Food",   to: "/services/home-food" },
  { serviceCode: "TRAINING",    icon: <SchoolRoundedIcon sx={{ fontSize: 26, color: brand.muted }} />,       label: "Training",    to: "/services/training" },
];

export default function CustomerDashboard() {
  const [foods, setFoods]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [enabledMap, setEnabledMap] = useState({});
  const [modalOpen, setModalOpen]   = useState(false);

  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();
  const scrollRef      = useRef(null);
  const dragRef        = useRef({ dragging: false, startX: 0, scrollLeft: 0 });

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
  })();
  const firstName = (user.name || "there").split(" ")[0];

  // Load service config
  useEffect(() => {
    serviceConfigService.getServices()
      .then((configs) => {
        const map = {};
        configs.forEach((c) => { map[c.serviceCode] = c.isEnabled; });
        setEnabledMap(map);
      })
      .catch(() => {
        setEnabledMap({ CATERING: true, FOOD: true, LUNCH_BOX: true });
      });
  }, []);

  const handleCategoryClick = (cat) => {
    const enabled = enabledMap[cat.serviceCode] ?? false;
    if (enabled) navigate(cat.to);
    else setModalOpen(true);
  };

  const fetchFoods = useCallback(async (coords) => {
    try {
      setLoading(true);
      const geo  = coords || customerCoords;
      const data = await foodService.getCustomerFoods({
        customerLat: geo?.lat,
        customerLng: geo?.lng,
        limit: 5,
      });
      setFoods(data || []);
    } catch {
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [customerCoords]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  const handleWheel = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY + e.deltaX;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel, loading]);

  const handleMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = { dragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor     = "grabbing";
    el.style.userSelect = "none";
  };
  const handleMouseMove = (e) => {
    if (!dragRef.current.dragging) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = dragRef.current.scrollLeft - (e.pageX - el.offsetLeft - dragRef.current.startX);
  };
  const handleMouseUp = () => {
    dragRef.current.dragging = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor     = "grab";
      scrollRef.current.style.userSelect = "";
    }
  };

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
          <SearchSuggestions placeholder="Search for catering, lunch boxes, cooks…" fullWidth />
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
            <Typography variant="body2" sx={{ opacity: 0.85 }}>pure · fresh · trusted</Typography>
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
            overflowX: "auto", pt: 1, pb: 0.5,
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {CATEGORIES.map((cat) => {
            const enabled = enabledMap[cat.serviceCode] ?? false;
            return (
              <Box
                key={cat.label}
                onClick={() => handleCategoryClick(cat)}
                sx={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 0.75, cursor: "pointer", flexShrink: 0,
                  minWidth: { xs: 72, md: 90 },
                  opacity: enabled ? 1 : 0.65,
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      width: { xs: 56, md: 68 }, height: { xs: 56, md: 68 },
                      borderRadius: 3,
                      backgroundColor: enabled ? brand.orangeLight : brand.border,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background-color 0.15s, transform 0.15s",
                      "&:hover": enabled
                        ? { backgroundColor: brand.greenLight, transform: "translateY(-3px)" }
                        : { transform: "translateY(-2px)" },
                    }}
                  >
                    {cat.icon}
                  </Box>
                  {!enabled && (
                    <Chip
                      label="Soon"
                      size="small"
                      sx={{
                        position: "absolute", top: -6, right: -6,
                        height: 16, fontSize: "0.58rem", fontWeight: 700,
                        backgroundColor: brand.muted, color: "white",
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, textAlign: "center", lineHeight: 1.2, fontSize: { md: "0.78rem" } }}
                >
                  {cat.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Latest Foods carousel */}
        <LatestFoodsCarousel />

        {/* Recommended for you */}
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
          <Box
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            sx={{
              display: "flex", gap: 2, overflowX: "auto", pb: 1, cursor: "grab",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorX: "contain",
            }}
          >
            {foods.map((food) => (
              <Box key={food.foodId || food.id} sx={{ width: CARD_W, minWidth: CARD_W, flexShrink: 0 }}>
                <FoodCard
                  food={food}
                  onClick={() => navigate(`/customer/food/${food.foodId || food.id}`)}
                />
              </Box>
            ))}
          </Box>
        )}

      </Container>

      <ComingSoonModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppLayout>
  );
}
