import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Toolbar, Typography, IconButton, Button,
  Stack, CircularProgress, Alert, Divider, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import { useCart } from "../../contexts/CartContext";
import orderService from "../../services/orderService";
import TopNav from "../../components/TopNav";
import { brand } from "../../theme";
import {
  useCustomerGeo, haversineKm, travelTimeMinutes,
  etaRange, formatEta, formatArrivalTime,
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
  const { items, total, cartCount, updateQty, removeFromCart, clearCart, loading } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError]             = useState("");
  const [confirmation, setConfirmation] = useState(null); // { etaMinutes, expectedArrivalAt }

  // Calculate ETA for each item and derive overall worst-case ETA
  const itemsWithEta = useMemo(
    () => items.map((i) => ({ ...i, _eta: itemEta(i, customerCoords) })),
    [items, customerCoords]
  );

  const overallEta = useMemo(() => {
    const etaValues = itemsWithEta.map((i) => i._eta).filter((v) => v != null);
    return etaValues.length > 0 ? Math.max(...etaValues) : null;
  }, [itemsWithEta]);

  const expectedArrival = useMemo(() => {
    if (!overallEta) return null;
    const d = new Date(Date.now() + overallEta * 60_000);
    return d;
  }, [overallEta]);

  const handleCheckout = async () => {
    if (!items.length) return;
    setCheckingOut(true);
    setError("");
    try {
      const order = await orderService.createOrder({
        items: items.map((i) => ({ food_item_id: i.food_item_id, quantity: i.quantity })),
        customer_lat: customerCoords?.lat,
        customer_lng: customerCoords?.lng,
      });
      await clearCart();
      // Show confirmation dialog using backend ETA if available, else frontend calc
      const eta     = order?.eta_minutes    ?? overallEta;
      const arrival = order?.expected_arrival_at ?? expectedArrival;
      setConfirmation({ etaMinutes: eta, expectedArrivalAt: arrival });
    } catch (err) {
      setError(err?.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleConfirmClose = () => {
    setConfirmation(null);
    navigate("/customer/orders");
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                    {/* Thumbnail */}
                    <Box
                      sx={{
                        width: 64, height: 64, borderRadius: 2, flexShrink: 0,
                        background: item.image_url
                          ? `url(${item.image_url}) center/cover no-repeat`
                          : `linear-gradient(135deg, ${brand.orangeLight}, #FFD0A0)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {!item.image_url && <DinnerDiningRoundedIcon sx={{ fontSize: 28, color: brand.orange, opacity: 0.7 }} />}
                    </Box>

                    {/* Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {item.food_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }} noWrap>
                        {item.caterer_name}
                      </Typography>

                      {/* Per-item ETA */}
                      {item._eta != null && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.25 }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 11, color: "#1565c0" }} />
                          <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: 600, fontSize: "0.65rem" }}>
                            {etaRange(item._eta)}
                          </Typography>
                        </Box>
                      )}

                      {!item.is_available && (
                        <Chip label="Unavailable" size="small" color="default" sx={{ height: 18, fontSize: "0.6rem", mt: 0.5 }} />
                      )}
                    </Box>

                    {/* Price */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange, flexShrink: 0, minWidth: 64, textAlign: "right" }}>
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </Typography>

                    {/* Qty controls */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => updateQty(item.id, item.quantity - 1)}
                        sx={{ width: 28, height: 28, backgroundColor: brand.orangeLight, color: brand.orange }}>
                        <RemoveRoundedIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>
                        {item.quantity}
                      </Typography>
                      <IconButton size="small" onClick={() => updateQty(item.id, item.quantity + 1)}
                        sx={{ width: 28, height: 28, backgroundColor: brand.orange, color: "white" }}>
                        <AddRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Remove */}
                    <IconButton size="small" onClick={() => removeFromCart(item.id)}
                      sx={{ color: "text.disabled", "&:hover": { color: "error.main" }, flexShrink: 0 }}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
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
                    backgroundColor: "#E3F2FD", border: "1px solid #BBDEFB",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DirectionsBikeRoundedIcon sx={{ color: "#1565c0", fontSize: 18 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#1565c0", display: "block", lineHeight: 1.2 }}>
                        Estimated Delivery
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#1565c0" }}>
                        {etaRange(overallEta)}
                      </Typography>
                    </Box>
                  </Box>
                  {expectedArrival && (
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#1565c0" }}>
                      By {formatArrivalTime(expectedArrival)}
                    </Typography>
                  )}
                </Box>
              )}

              <Button
                fullWidth variant="contained" size="large"
                startIcon={checkingOut ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartCheckoutRoundedIcon />}
                onClick={handleCheckout}
                disabled={checkingOut || !items.length}
                sx={{ fontWeight: 700, py: 1.25 }}
              >
                {checkingOut ? "Placing Order…" : "Checkout"}
              </Button>
            </Paper>
          </Stack>
        )}
      </Container>

      {/* Order confirmation dialog */}
      <Dialog open={!!confirmation} onClose={handleConfirmClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pt: 3, pb: 1 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 52, color: "#4caf50", mb: 1, display: "block", mx: "auto" }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Order Placed!</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", px: 3 }}>
          {confirmation?.etaMinutes != null ? (
            <Stack spacing={1.5} alignItems="center" sx={{ py: 1 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#E3F2FD", width: "100%" }}>
                <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: 600, display: "block" }}>
                  Estimated Delivery
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#1565c0" }}>
                  {etaRange(confirmation.etaMinutes)}
                </Typography>
              </Box>
              {confirmation.expectedArrivalAt && (
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: brand.orangeLight, width: "100%" }}>
                  <Typography variant="caption" sx={{ color: brand.orange, fontWeight: 600, display: "block" }}>
                    Expected Arrival
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: brand.orange }}>
                    {formatArrivalTime(confirmation.expectedArrivalAt)}
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
              Your order has been placed successfully.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button fullWidth variant="contained" onClick={handleConfirmClose} sx={{ fontWeight: 700 }}>
            View My Orders
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
