import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Toolbar,
  InputBase,
  Card,
  Chip,
  Typography,
  CircularProgress,
  IconButton,
  Grid,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import { brand } from "../../theme";
import TopNav from "../../components/TopNav";
import foodService from "../../services/foodService";

const FILTERS = ["All", "Pure Veg", "Jain", "Satvik", "More"];

export default function FoodSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const data = await foodService.getFoods();
        setFoods(data || []);
      } catch (err) {
        console.error("Failed to fetch foods:", err);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchQuery.trim()) {
      setFilteredFoods(foods);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredFoods(
      foods.filter(
        (food) =>
          food.name.toLowerCase().includes(query) ||
          (food.description && food.description.toLowerCase().includes(query)) ||
          (food.caterer && food.caterer.toLowerCase().includes(query)),
      ),
    );
  };

  const displayFoods = hasSearched ? filteredFoods : foods;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

      <Container maxWidth="lg" sx={{ pt: 2.5, pb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Browse Caterers & Food
        </Typography>

        {/* Search bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: "flex", gap: 1, mb: 1.5, maxWidth: 600 }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: brand.white,
              border: `1px solid ${brand.border}`,
              borderRadius: 6,
              px: 2,
              "&:focus-within": { borderColor: brand.orange },
              transition: "border-color 0.15s",
            }}
          >
            <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <InputBase
              fullWidth
              placeholder="Search caterers, food, cuisine…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ py: 1.1, fontSize: "0.9rem" }}
            />
          </Box>
          <IconButton
            sx={{
              backgroundColor: brand.white,
              border: `1px solid ${brand.border}`,
              borderRadius: 2,
            }}
          >
            <TuneRoundedIcon sx={{ color: brand.orange }} />
          </IconButton>
        </Box>

        {/* Filter chips */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 2.5,
            overflowX: "auto",
            pb: 0.5,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              onClick={() => setActiveFilter(f)}
              sx={{
                fontWeight: 600,
                flexShrink: 0,
                backgroundColor: activeFilter === f ? brand.orange : brand.white,
                color: activeFilter === f ? "white" : "text.secondary",
                border: `1px solid ${activeFilter === f ? brand.orange : brand.border}`,
                "&:hover": {
                  backgroundColor: activeFilter === f ? brand.orange : brand.orangeLight,
                },
              }}
            />
          ))}
        </Box>

        {hasSearched && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            Found {displayFoods.length} result{displayFoods.length !== 1 ? "s" : ""}
            {searchQuery ? ` for "${searchQuery}"` : ""}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : displayFoods.length > 0 ? (
          <Grid container spacing={2}>
            {displayFoods.map((food) => (
              <Grid item key={food.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  onClick={() => navigate(`/customer/food/${food.id}`)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    cursor: "pointer",
                    transition: "border-color 0.15s, transform 0.15s",
                    "&:hover": { borderColor: brand.orange, transform: "translateY(-2px)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${brand.orangeLight}, #FFD0A0)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DinnerDiningRoundedIcon sx={{ fontSize: 30, color: brand.orange, opacity: 0.8 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                      {food.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "block" }}
                      noWrap
                    >
                      {food.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 0.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StarRoundedIcon sx={{ fontSize: 14, color: brand.star }} />
                          <Typography variant="caption" sx={{ ml: 0.25 }}>
                            4.8
                          </Typography>
                        </Box>
                        <Chip
                          label="Veg"
                          size="small"
                          sx={{ height: 18, fontSize: "0.6rem", backgroundColor: brand.greenLight, color: brand.green }}
                        />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                        ₹{food.price}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
            <SearchRoundedIcon sx={{ fontSize: 48, color: brand.border, mb: 1 }} />
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              No results found
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Try searching with different keywords
            </Typography>
          </Card>
        )}
      </Container>
    </Box>
  );
}
