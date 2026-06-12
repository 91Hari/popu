import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, IconButton, Button,
  Stack, CircularProgress, Alert, Divider, Paper, Chip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import { useCart } from "../../contexts/CartContext";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import {
  useCustomerGeo, haversineKm, travelTimeMinutes, etaRange, formatArrivalTime,
} from "../../utils/geoUtils";

function itemEta(item, customerCoords) {
  if (!customerCoords) return null;
  const lat = item.caterer_latitude != null ? Number(item.caterer_latitude) : null;
  const lng = item.caterer_longitude != null ? Number(item.caterer_longitude) : null;
  if (lat == null || lng == null) return null;
  const dist   = haversineKm(customerCoords.lat, customerCoords.lng, lat, lng);
  const travel = travelTimeMinutes(dist);
  const prep   = item.preparation_time_minutes || 20;
  return prep + travel;
}

export default function CartPage() {
  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();
  const { items, total, cartCount, updateQty, removeFromCart, loading } = useCart();

  useEffect(() => { console.log("[Diag] CartPage mounted, items:", items?.length); }, []);
  const [error, setError] = useState("");

  // Calculate ETA for each item and derive overall worst-case ETA
  const itemsWithEta = useMemo(
    () => items.map((i) => ({ ...i, _eta: itemEta(i, customerCoords) })),
    [items, customerCoords]
  );

  const unavailableItems = useMemo(
    () => items.filter((i) => i.is_available === false),
    [items]
  );
  const hasUnavailableItems = unavailableItems.length > 0;

  const overallEta = useMemo(() => {
    const etaValues = itemsWithEta.map((i) => i._eta).filter((v) => v != null);
    return etaValues.length > 0 ? Math.max(...etaValues) : null;
  }, [itemsWithEta]);

  const expectedArrival = useMemo(() => {
    if (!overallEta) return null;
    const d = new Date(Date.now() + overallEta * 60_000);
    return d;
  }, [overallEta]);

  const handleCheckout = () => {
    if (!items.length) return;
    navigate("/checkout/split");
  };

  return (
    <AppLayout>

      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <ShoppingCartRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Your Cart</Typography>
            {cartCount > 0 && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {cartCount} item{cartCount !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && !items.length ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : items.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 3 }}>
            <ShoppingCartRoundedIcon sx={{ fontSize: 64, color: brand.border, mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>Your cart is empty</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Browse food items and add them to your cart.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/services/tiffins")}>Browse Food</Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {/* Items list */}
            <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, overflow: "hidden" }}>
              {itemsWithEta.map((item, idx) => (
                <Box key={item.id}>
                  <Box sx={{ display: "flex", gap: 1.5, p: 2 }}>
                    {/* Thumbnail */}
                    <Box
                      sx={{
                        width: 64, height: 64, borderRadius: 2, flexShrink: 0,
                        background: item.image_url
                          ? `url(${item.image_url}) center/cover no-repeat`
                          : `linear-gradient(135deg, ${brand.greenLight}, #A5D6A7)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {!item.image_url && <DinnerDiningRoundedIcon sx={{ fontSize: 28, color: brand.orange, opacity: 0.7 }} />}
                    </Box>

                    {/* Content column */}
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                      {/* Name + Price */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.food_name}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange, flexShrink: 0 }}>
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>

                      {/* Caterer */}
                      <Typography variant="caption" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.caterer_name}
                      </Typography>

                      {/* Per-item ETA */}
                      {item._eta != null && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.25 }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 11, color: brand.orange }} />
                          <Typography variant="caption" sx={{ color: brand.orange, fontWeight: 600, fontSize: "0.65rem" }}>
                            {etaRange(item._eta)}
                          </Typography>
                        </Box>
                      )}

                      {!item.is_available && (
                        <Chip label="Unavailable" size="small" color="default" sx={{ height: 18, fontSize: "0.6rem", mt: 0.5, alignSelf: "flex-start" }} />
                      )}

                      {/* Qty controls + Remove */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: "auto", pt: 0.75 }}>
                        <IconButton size="small" onClick={() => updateQty(item.id, item.quantity - 1)}
                          sx={{ width: 30, height: 30, backgroundColor: brand.greenLight, color: brand.orange }}>
                          <RemoveRoundedIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>
                          {item.quantity}
                        </Typography>
                        <IconButton size="small"
                          disabled={item.is_available === false}
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          sx={{ width: 30, height: 30, backgroundColor: brand.orange, color: "white",
                            "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#bdbdbd" } }}>
                          <AddRoundedIcon fontSize="small" />
                        </IconButton>
                        <Box sx={{ flex: 1 }} />
                        <IconButton size="small" onClick={() => removeFromCart(item.id)}
                          sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                  {idx < itemsWithEta.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>

            {/* Summary */}
            <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Order Summary</Typography>

              <Stack spacing={0.75}>
                {items.map((item) => (
                  <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                      {item.food_name} × {item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ flexShrink: 0, ml: 1 }}>
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>
                  ₹{Number(total).toFixed(2)}
                </Typography>
              </Box>

              {/* Overall ETA summary row */}
              {overallEta != null && (
                <Box
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    mb: 2, p: 1.25, borderRadius: 1.5,
                    backgroundColor: brand.greenLight, border: `1px solid ${brand.border}`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DirectionsBikeRoundedIcon sx={{ color: brand.orange, fontSize: 18 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: brand.orange, display: "block", lineHeight: 1.2 }}>
                        Estimated Delivery
                      </Typography>
                      <Typography variant="caption" sx={{ color: brand.orange }}>
                        {etaRange(overallEta)}
                      </Typography>
                    </Box>
                  </Box>
                  {expectedArrival && (
                    <Typography variant="caption" sx={{ fontWeight: 700, color: brand.orange }}>
                      By {formatArrivalTime(expectedArrival)}
                    </Typography>
                  )}
                </Box>
              )}

              {hasUnavailableItems && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {unavailableItems.map((i) => `"${i.food_name}"`).join(", ")}{" "}
                  {unavailableItems.length === 1 ? "is" : "are"} no longer available. Remove{" "}
                  {unavailableItems.length === 1 ? "it" : "them"} before checkout.
                </Alert>
              )}

              <Button
                fullWidth variant="contained" size="large"
                startIcon={<ShoppingCartCheckoutRoundedIcon />}
                onClick={handleCheckout}
                disabled={!items.length || hasUnavailableItems}
                sx={{ fontWeight: 700, py: 1.25 }}
              >
                Checkout
              </Button>
            </Paper>
          </Stack>
        )}
      </Container>

    </AppLayout>
  );
}
