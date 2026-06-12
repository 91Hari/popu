import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, CircularProgress,
  Alert, Stack, Paper, Divider,
} from "@mui/material";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import DinnerDiningRoundedIcon         from "@mui/icons-material/DinnerDiningRounded";
import LockRoundedIcon                 from "@mui/icons-material/LockRounded";
import { useCart }         from "../../contexts/CartContext";
import paymentService      from "../../services/paymentService";
import AppLayout           from "../../components/AppLayout";
import { brand }           from "../../theme";
import { useCustomerGeo }  from "../../utils/geoUtils";

export default function SplitCheckoutPage() {
  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();
  const { items, total } = useCart();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const catererGroups = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.caterer_id)) {
        map.set(item.caterer_id, {
          caterer_id:   item.caterer_id,
          caterer_name: item.caterer_name,
          items: [],
        });
      }
      map.get(item.caterer_id).items.push(item);
    }
    return [...map.values()];
  }, [items]);

  const unavailableItems = useMemo(
    () => items.filter((i) => i.is_available === false),
    [items]
  );

  const handlePayWithPhonePe = async () => {
    if (!items.length) return;
    setLoading(true);
    setError("");
    try {
      const result = await paymentService.initiate({
        items:       items.map((i) => ({ food_item_id: i.food_item_id, quantity: i.quantity })),
        customerLat: customerCoords?.lat,
        customerLng: customerCoords?.lng,
      });
      // Redirect to PhonePe — browser leaves this page
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setError(err?.message || "Could not initiate payment. Please try again.");
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
            Your cart is empty.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/services/food-marketplace")}>
            Browse Food
          </Button>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <ShoppingCartCheckoutRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Checkout</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {unavailableItems.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {unavailableItems.map((i) => `"${i.food_name}"`).join(", ")}{" "}
            {unavailableItems.length === 1 ? "is" : "are"} no longer available. Go back and remove{" "}
            {unavailableItems.length === 1 ? "it" : "them"} before proceeding.
          </Alert>
        )}

        <Stack spacing={2.5}>
          {/* Order breakdown by caterer */}
          {catererGroups.map((group) => {
            const subtotal = group.items.reduce(
              (s, i) => s + Number(i.price) * i.quantity, 0
            );
            return (
              <Paper
                key={group.caterer_id}
                elevation={0}
                sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, overflow: "hidden" }}
              >
                <Box sx={{
                  px: 2.5, py: 1.5,
                  backgroundColor: brand.greenLight,
                  borderBottom: `1px solid ${brand.border}`,
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brand.orange }}>
                    {group.caterer_name}
                  </Typography>
                </Box>

                <Box sx={{ px: 2.5, py: 1.5 }}>
                  <Stack spacing={1}>
                    {group.items.map((item) => (
                      <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                          background: `linear-gradient(135deg, ${brand.greenLight}, #A5D6A7)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <DinnerDiningRoundedIcon sx={{ fontSize: 18, color: brand.orange, opacity: 0.7 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.food_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {item.quantity} × ₹{Number(item.price).toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: brand.orange }}>
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                      Subtotal: ₹{subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            );
          })}

          {/* Total + PhonePe pay button */}
          <Paper
            elevation={0}
            sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5 }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>
                ₹{Number(total).toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 1, mb: 1.5, p: 1.25,
                borderRadius: 2, backgroundColor: "#F0F4FF",
                border: "1px solid #C5D0F0",
              }}
            >
              <LockRoundedIcon sx={{ fontSize: 16, color: "#5A4EE8" }} />
              <Typography variant="caption" sx={{ color: "#5A4EE8", fontWeight: 600 }}>
                Secured by PhonePe — 100% safe &amp; encrypted
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handlePayWithPhonePe}
              disabled={loading || !items.length || unavailableItems.length > 0}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                fontWeight: 700,
                py: 1.4,
                background: loading ? undefined : "linear-gradient(135deg, #5A4EE8, #7B6CF0)",
                "&:hover": { background: "linear-gradient(135deg, #4A3ED8, #6B5CE0)" },
              }}
            >
              {loading
                ? "Redirecting to PhonePe…"
                : `Pay ₹${Number(total).toFixed(2)} with PhonePe`}
            </Button>

            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mt: 1.5, textAlign: "center" }}
            >
              Your order is confirmed only after successful payment.
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  );
}
