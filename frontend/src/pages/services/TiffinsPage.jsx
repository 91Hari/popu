import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, InputBase, IconButton,
  Grid, CircularProgress, Alert, Select, MenuItem, FormControl,
  Stack, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import FoodCard from "../../components/FoodCard";
import EmptyState from "../../components/EmptyState";
import foodService from "../../services/foodService";

const SORT_OPTIONS = [
  { value: "default",    label: "Default" },
  { value: "price_asc",  label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
];

function sortFoods(foods, sort) {
  if (sort === "price_asc")  return [...foods].sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === "price_desc") return [...foods].sort((a, b) => Number(b.price) - Number(a.price));
  return foods;
}

export default function TiffinsPage() {
  const navigate = useNavigate();

  const [foods, setFoods]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [inputVal, setInputVal]     = useState("");
  const [catererFilter, setCaterer] = useState("");
  const [categoryFilter, setCategory] = useState(""); // "" | "VEG" | "NON_VEG"
  const [sort, setSort]             = useState("default");
  const [catererNames, setCaterers] = useState([]);

  const load = useCallback(async (foodName, catererName, foodCategory) => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (foodName || catererName) {
        data = await foodService.searchFoodsFull({
          foodName, catererName, available: true,
          food_category: foodCategory || undefined,
        });
      } else {
        data = await foodService.getCustomerFoods({
          food_category: foodCategory || undefined,
        });
      }
      setFoods(data || []);
      const names = [...new Set((data || []).map((f) => f.catererName || f.caterer_name).filter(Boolean))];
      setCaterers(names.sort());
    } catch (err) {
      setError(err?.message || "Failed to load food items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load("", "", categoryFilter); }, [load, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    load(q, catererFilter, categoryFilter);
  };

  const handleCatererChange = (e) => {
    const val = e.target.value;
    setCaterer(val);
    load(inputVal.trim(), val, categoryFilter);
  };

  const handleCategoryChange = (_, val) => {
    if (val === null) return;
    setCategory(val);
    load(inputVal.trim(), catererFilter, val);
  };

  const displayed = sortFoods(foods, sort);

  return (
    <AppLayout>

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
          <LunchDiningRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>Food Marketplace</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {displayed.length} item{displayed.length !== 1 ? "s" : ""} available
            </Typography>
          </Box>
        </Stack>

        {/* Category filter */}
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <ToggleButtonGroup size="small" exclusive value={categoryFilter} onChange={handleCategoryChange}>
            {[
              { value: "", label: "All" },
              { value: "VEG",     label: "🟢 Veg" },
              { value: "NON_VEG", label: "🔴 Non-Veg" },
            ].map((o) => (
              <ToggleButton
                key={o.value} value={o.value}
                sx={{
                  px: 2, fontWeight: 700, fontSize: "0.8rem", textTransform: "none",
                  "&.Mui-selected": {
                    backgroundColor: o.value === "VEG" ? "#E8F5E9" : o.value === "NON_VEG" ? "#FFEBEE" : brand.orangeLight,
                    color:           o.value === "VEG" ? "#2E7D32" : o.value === "NON_VEG" ? "#B71C1C" : brand.orange,
                  },
                }}
              >
                {o.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ mb: 3 }} flexWrap="wrap">
          <Box
            component="form" onSubmit={handleSearchSubmit}
            sx={{
              flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 1,
              backgroundColor: brand.white, border: `1px solid ${brand.border}`,
              borderRadius: 6, px: 2,
              "&:focus-within": { borderColor: brand.orange },
            }}
          >
            <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <InputBase
              fullWidth placeholder="Search food name…"
              value={inputVal} onChange={(e) => setInputVal(e.target.value)}
              sx={{ py: 1.1, fontSize: "0.9rem" }}
            />
            <IconButton type="submit" size="small" sx={{ color: brand.orange }}>
              <SearchRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {catererNames.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                displayEmpty value={catererFilter} onChange={handleCatererChange}
                sx={{ borderRadius: 6, backgroundColor: brand.white, fontSize: "0.9rem" }}
                renderValue={(v) => v || "All Caterers"}
              >
                <MenuItem value="">All Caterers</MenuItem>
                {catererNames.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </Select>
            </FormControl>
          )}

          <Stack direction="row" alignItems="center" gap={0.75}>
            <SortRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <ToggleButtonGroup size="small" exclusive value={sort} onChange={(_, v) => v && setSort(v)}>
              {SORT_OPTIONS.map((o) => (
                <ToggleButton
                  key={o.value} value={o.value}
                  sx={{
                    fontSize: "0.75rem", px: 1.5, fontWeight: 600,
                    "&.Mui-selected": { backgroundColor: brand.orangeLight, color: brand.orange },
                  }}
                >
                  {o.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={<LunchDiningRoundedIcon sx={{ fontSize: 64, color: brand.border, mb: 0.5 }} />}
            title="0 Results Found"
            message="No food items match your search."
            hint="Try another food name, caterer, or adjust your filters."
          />
        ) : (
          <Grid container spacing={2} alignItems="flex-start">
            {displayed.map((food) => (
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
