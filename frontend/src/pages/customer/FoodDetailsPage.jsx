import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Stack,
  CircularProgress,
  TextField,
  useMediaQuery,
  useTheme,
  Alert,
  Chip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonPinRoundedIcon from "@mui/icons-material/PersonPinRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import foodService from "../../services/foodService";
import { useCart } from "../../contexts/CartContext";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import { useCustomerGeo } from "../../utils/geoUtils";

export default function FoodDetailsPage() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();
  const { addToCart }         = useCart();
  const [food, setFood]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [qty, setQty]         = useState(1);
  const [placing, setPlacing] = useState(false);
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);
        const data = await foodService.getFoodById(id, {
          customerLat: customerCoords?.lat,
          customerLng: customerCoords?.lng,
        });
        setFood(data);
      } catch (err) {
        console.error("Error fetching food:", err);
        setError("Failed to load food details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFood();
  }, [id, customerCoords]);

  const isAvailable = food ? (food.is_available ?? true) : true;

  const increase = () => setQty((q) => Math.min(q + 1, 99));
  const decrease = () => setQty((q) => Math.max(q - 1, 1));

  const handleQtyChange = (e) => {
    const v = Number(e.target.value || 0);
    if (Number.isNaN(v)) return;
    setQty(Math.max(1, Math.min(99, Math.floor(v))));
  };

  const handlePlaceOrder = async () => {
    if (!food) return;
    setPlacing(true);
    setError("");
    try {
      await addToCart(food.foodId || food.id, qty);
      navigate("/checkout/split");
    } catch (err) {
      console.error("Add to cart failed:", err);
      setError(err?.message || "Failed to add to cart. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </AppLayout>
    );
  }

  if (error && !food) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </AppLayout>
    );
  }

  if (!food) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="info">Food not found.</Alert>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>

      <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, color: brand.muted }}
        >
          Back
        </Button>

        <Card
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            overflow: "hidden",
          }}
        >
          {/* Food image */}
          <Box
            sx={{
              width: isMobile ? "100%" : "42%",
              minHeight: isMobile ? 220 : 320,
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              background: `linear-gradient(135deg, ${brand.orangeLight}, #A5D6A7)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {(food.imageUrl || food.image_url) ? (
              <Box
                component="img"
                src={food.imageUrl || food.image_url}
                alt={food.food_name}
                sx={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <DinnerDiningRoundedIcon
                sx={{ fontSize: isMobile ? 72 : 100, color: brand.orange, opacity: 0.6 }}
              />
            )}
          </Box>

          <CardContent sx={{ flex: 1, p: { xs: 2.5, md: 3 } }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" flexWrap="wrap" useFlexGap>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: brand.dark }}>
                {food.food_name}
              </Typography>
              <Chip
                label={isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  mt: "3px",
                  backgroundColor: isAvailable ? brand.greenLight : "#FFEBEE",
                  color: isAvailable ? brand.green : "#C62828",
                }}
              />
            </Stack>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75 }}>
              <PersonPinRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                By: {food.caterer_name || "Premium Caterer"}
              </Typography>
            </Box>

            {/* ETA section */}
            {food.estimatedDeliveryTime != null && (
              <Box
                sx={{
                  display: "flex", alignItems: "center", gap: 2, mt: 1.5, p: 1.5,
                  borderRadius: 2, backgroundColor: brand.greenLight, border: `1px solid ${brand.border}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <DirectionsBikeRoundedIcon sx={{ color: brand.orange, fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: brand.orange, fontWeight: 700, display: "block", lineHeight: 1.2 }}>
                      Estimated Delivery
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: brand.orange, fontWeight: 800 }}>
                      {food.etaRange || `${food.estimatedDeliveryTime} mins`}
                    </Typography>
                  </Box>
                </Box>
                {food.distanceKm != null && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeRoundedIcon sx={{ color: brand.orange, fontSize: 16 }} />
                    <Typography variant="caption" sx={{ color: brand.orange }}>
                      {food.distanceKm} km away
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Typography variant="body1" sx={{ mt: 2, color: "text.secondary", lineHeight: 1.7 }}>
              {food.description}
            </Typography>

            {!isAvailable && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This item is currently unavailable and cannot be ordered.
              </Alert>
            )}

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3, mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: brand.orange }}>
                ₹{food.price}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, opacity: isAvailable ? 1 : 0.4 }}>
                <IconButton
                  onClick={decrease}
                  size="small"
                  disabled={!isAvailable}
                  sx={{
                    backgroundColor: brand.greenLight,
                    color: brand.orange,
                    "&:hover": { backgroundColor: brand.border },
                  }}
                >
                  <RemoveRoundedIcon fontSize="small" />
                </IconButton>

                <TextField
                  value={qty}
                  onChange={handleQtyChange}
                  disabled={!isAvailable}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "center", width: 48, fontWeight: 700 },
                  }}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                <IconButton
                  onClick={increase}
                  size="small"
                  disabled={!isAvailable}
                  sx={{
                    backgroundColor: brand.orange,
                    color: "white",
                    "&:hover": { backgroundColor: brand.orangeMid },
                  }}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth={isMobile}
              onClick={handlePlaceOrder}
              disabled={placing || !isAvailable}
              sx={{ fontWeight: 700, px: 4, py: 1.25 }}
            >
              {placing ? (
                <CircularProgress size={18} sx={{ color: "white", mr: 1 }} />
              ) : null}
              {isAvailable ? "Place Order" : "Item Unavailable"}
            </Button>
          </CardContent>
        </Card>
      </Container>
    </AppLayout>
  );
}
