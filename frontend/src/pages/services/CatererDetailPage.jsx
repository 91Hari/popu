import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Container, Typography, Grid, CircularProgress,
  Alert, Chip, Stack, Paper, Button, Divider,
} from "@mui/material";
import EventRoundedIcon       from "@mui/icons-material/EventRounded";
import LocationOnRoundedIcon  from "@mui/icons-material/LocationOnRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import api from "../../services/api";
import reviewService from "../../services/reviewService";
import FoodCard from "../../components/FoodCard";
import ReviewsList from "../../components/ReviewsList";
import { StarDisplay } from "../../components/StarRating";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import { useCustomerGeo, haversineKm, etaMinutes, formatDistance, formatEta } from "../../utils/geoUtils";

export default function CatererDetailPage() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [reviewSummary, setReviewSummary] = useState({ avg_rating: null, total: 0 });

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

  useEffect(() => {
    if (!id) return;
    reviewService.getReviews("caterer", id, { limit: 1 })
      .then((d) => setReviewSummary({ avg_rating: d?.avg_rating ?? null, total: d?.total ?? 0 }))
      .catch(() => {});
  }, [id]);

  const caterer   = data?.caterer;
  const foods     = data?.foods || [];

  const vegFoods    = foods.filter((f) => (f.food_category || "VEG") === "VEG");
  const nonVegFoods = foods.filter((f) => f.food_category === "NON_VEG");

  const FoodGroup = ({ title, dot, dotColor, borderColor, groupFoods }) => {
    if (!groupFoods.length) return null;
    return (
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, mt: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: dot, backgroundColor: dotColor, border: `2px solid ${borderColor}`, flexShrink: 0 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{title}</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>({groupFoods.filter(f => f.is_available).length} available)</Typography>
        </Box>
        <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
          {groupFoods.map((food) => (
            <Grid item key={food.id} xs={6} sm={4} md={3} lg={2}>
              <FoodCard
                food={{ ...food, catererName: caterer.catererName }}
                onClick={food.is_available ? () => navigate(`/customer/food/${food.id}`) : undefined}
              />
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  const hasDistance = customerCoords && caterer?.latitude != null && caterer?.longitude != null;
  const distKm = hasDistance
    ? haversineKm(customerCoords.lat, customerCoords.lng, Number(caterer.latitude), Number(caterer.longitude))
    : null;
  const eta = distKm != null ? etaMinutes(distKm) : null;

  return (
    <AppLayout>

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>


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
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap>
                  {(caterer.address || caterer.location) && (
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.4 }}>
                      <LocationOnRoundedIcon sx={{ fontSize: 14, color: "text.secondary", mt: "1px", flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {caterer.address || caterer.location}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {distKm != null && (
                    <>
                      <Chip
                        icon={<DirectionsBikeRoundedIcon sx={{ fontSize: "14px !important" }} />}
                        label={formatDistance(distKm)}
                        size="small"
                        sx={{ height: 26, backgroundColor: "#E8F5E9", color: "#2e7d32", "& .MuiChip-icon": { color: "#2e7d32" }, fontSize: "0.75rem" }}
                      />
                      <Chip
                        icon={<AccessTimeRoundedIcon sx={{ fontSize: "14px !important" }} />}
                        label={`~${formatEta(eta)} delivery`}
                        size="small"
                        sx={{ height: 26, backgroundColor: brand.greenLight, color: brand.orange, "& .MuiChip-icon": { color: brand.orange }, fontSize: "0.75rem" }}
                      />
                    </>
                  )}
                  <Chip
                    icon={<RestaurantMenuRoundedIcon sx={{ fontSize: "14px !important" }} />}
                    label={`${foods.filter((f) => f.is_available).length} item${foods.filter((f) => f.is_available).length !== 1 ? "s" : ""} available`}
                    size="small"
                    sx={{ height: 26, backgroundColor: brand.goldLight, color: brand.text, fontSize: "0.75rem" }}
                  />
                  {reviewSummary.avg_rating != null && (
                    <Box sx={{ display: "flex", alignItems: "center", height: 26 }}>
                      <StarDisplay rating={Number(reviewSummary.avg_rating)} count={reviewSummary.total} size={14} />
                    </Box>
                  )}
                </Stack>
                {caterer.cateringAvailable && (
                  <Button
                    variant="contained"
                    startIcon={<EventRoundedIcon />}
                    onClick={() => navigate(`/customer/catering-booking/${id}`)}
                    sx={{
                      mt: 1.5,
                      background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`,
                      textTransform: "none", fontWeight: 700,
                    }}
                  >
                    Book Catering for an Event
                  </Button>
                )}
              </Box>
            </Paper>

            {/* Foods grouped by Veg / Non-Veg */}
            <FoodGroup
              title="Veg Items"
              dot="50%"
              dotColor="#4CAF50"
              borderColor="#2E7D32"
              groupFoods={vegFoods}
            />
            <FoodGroup
              title="Non-Veg Items"
              dot="2px"
              dotColor="#E53935"
              borderColor="#B71C1C"
              groupFoods={nonVegFoods}
            />

            {foods.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <RestaurantMenuRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
                <Typography variant="h6" sx={{ color: "text.secondary" }}>No food items yet</Typography>
              </Box>
            )}

            {/* Caterer Reviews */}
            <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5, mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Caterer Reviews</Typography>
              <Divider sx={{ mb: 2 }} />
              <ReviewsList subjectType="caterer" subjectId={id} />
            </Paper>
          </>
        )}
      </Container>
    </AppLayout>
  );
}
