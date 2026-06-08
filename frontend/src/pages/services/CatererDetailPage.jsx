import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Container, Toolbar, Typography, Grid, CircularProgress,
  Alert, IconButton, Chip, Stack, Paper,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import api from "../../services/api";
import FoodCard from "../../components/FoodCard";
import TopNav from "../../components/TopNav";
import { brand } from "../../theme";

export default function CatererDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.request(`/caterers/${id}/foods`);
        setData(res);
      } catch (err) {
        setError(err?.message || "Failed to load caterer.");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const caterer = data?.caterer;
  const foods   = data?.foods || [];
  const available = foods.filter((f) => f.is_available);
  const unavailable = foods.filter((f) => !f.is_available);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <IconButton size="small" onClick={() => navigate("/services/catering")} sx={{ color: brand.muted, mb: 2 }}>
          <ArrowBackRoundedIcon />
        </IconButton>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : !caterer ? (
          <Alert severity="info">Caterer not found.</Alert>
        ) : (
          <>
            {/* Caterer header */}
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${brand.border}`,
                borderRadius: 3,
                overflow: "hidden",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  height: 110,
                  background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <RestaurantMenuRoundedIcon sx={{ fontSize: 52, color: "white", opacity: 0.5 }} />
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {caterer.catererName}
                </Typography>
                {caterer.businessName && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {caterer.businessName}
                  </Typography>
                )}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.25 }} flexWrap="wrap">
                  {caterer.location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <LocationOnRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{caterer.location}</Typography>
                    </Box>
                  )}
                  <Chip
                    icon={<RestaurantMenuRoundedIcon sx={{ fontSize: "14px !important" }} />}
                    label={`${available.length} item${available.length !== 1 ? "s" : ""} available`}
                    size="small"
                    sx={{ height: 24, backgroundColor: brand.orangeLight, color: brand.orange, fontSize: "0.75rem" }}
                  />
                </Stack>
              </Box>
            </Paper>

            {/* Available items */}
            {available.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Available Now
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {available.map((food) => (
                    <Grid item key={food.id} xs={6} sm={4} md={3} lg={2}>
                      <FoodCard
                        food={{ ...food, catererName: caterer.catererName }}
                        onClick={() => navigate(`/customer/food/${food.id}`)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Unavailable items */}
            {unavailable.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5 }}>
                  Currently Unavailable
                </Typography>
                <Grid container spacing={2}>
                  {unavailable.map((food) => (
                    <Grid item key={food.id} xs={6} sm={4} md={3} lg={2}>
                      <FoodCard
                        food={{ ...food, catererName: caterer.catererName }}
                        onClick={undefined}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {foods.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <RestaurantMenuRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
                <Typography variant="h6" sx={{ color: "text.secondary" }}>No food items yet</Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
