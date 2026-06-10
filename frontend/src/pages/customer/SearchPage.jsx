import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Toolbar, InputBase, Card, Chip,
  Typography, CircularProgress, IconButton, Grid,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import foodService from "../../services/foodService";

export default function FoodSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searched, setSearched]       = useState(false);
  const navigate = useNavigate();

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await foodService.getCustomerFoods();
      setFoods(data || []);
    } catch (err) {
      console.error(err);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(true);
    setLoading(true);
    try {
      const data = searchQuery.trim()
        ? await foodService.searchFoods(searchQuery.trim())
        : await foodService.getCustomerFoods();
      setFoods(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>

      <Container maxWidth="lg" sx={{ pt: 2.5, pb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Browse Caterers & Food
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: "flex", gap: 1, mb: 3, maxWidth: 600 }}
        >
          <Box
            sx={{
              flex: 1, display: "flex", alignItems: "center", gap: 1,
              backgroundColor: brand.white, border: `1px solid ${brand.border}`,
              borderRadius: 6, px: 2,
              "&:focus-within": { borderColor: brand.orange, boxShadow: `0 0 0 2px ${brand.greenLight}` },
            }}
          >
            <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <InputBase
              fullWidth
              placeholder="Search food, caterer…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ py: 1.1, fontSize: "0.9rem" }}
            />
          </Box>
          <IconButton
            type="submit"
            sx={{ backgroundColor: brand.orange, borderRadius: 2, color: "white",
              "&:hover": { backgroundColor: brand.orangeMid } }}
          >
            <SearchRoundedIcon />
          </IconButton>
        </Box>

        {searched && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            {foods.length} result{foods.length !== 1 ? "s" : ""}
            {searchQuery ? ` for "${searchQuery}"` : ""}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : foods.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
            <SearchRoundedIcon sx={{ fontSize: 48, color: brand.border, mb: 1 }} />
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              No results found
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {foods.map((food) => (
              <Grid item key={food.foodId} xs={12} sm={6} md={4} lg={3}>
                <Card
                  onClick={() => navigate(`/customer/food/${food.foodId}`)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, p: 1.5,
                    cursor: "pointer", transition: "transform 0.15s",
                    "&:hover": { borderColor: brand.orange, transform: "translateY(-2px)" },
                  }}
                >
                  <Box sx={{
                    width: 64, height: 64, flexShrink: 0, borderRadius: 2,
                    background: `linear-gradient(135deg, ${brand.greenLight}, #A5D6A7)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <DinnerDiningRoundedIcon sx={{ fontSize: 30, color: brand.orange, opacity: 0.8 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                      {food.foodName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }} noWrap>
                      By: {food.catererName}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <StarRoundedIcon sx={{ fontSize: 14, color: brand.star }} />
                        <Typography variant="caption" sx={{ ml: 0.25 }}>4.8</Typography>
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
        )}
      </Container>
    </AppLayout>
  );
}
