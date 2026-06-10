import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, CircularProgress,
  Alert, Stack, Paper, Divider, Chip, TextField,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon                  from "@mui/icons-material/ExpandMore";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import QrCodeRoundedIcon               from "@mui/icons-material/QrCodeRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import DinnerDiningRoundedIcon         from "@mui/icons-material/DinnerDiningRounded";
import { useCart } from "../../contexts/CartContext";
import masterOrderService from "../../services/masterOrderService";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import { useCustomerGeo } from "../../utils/geoUtils";

export default function SplitCheckoutPage() {
  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();
  const { items, total, clearCart } = useCart();

  const [catererProfiles, setCatererProfiles]   = useState({});
  const [paymentInputs, setPaymentInputs]       = useState({});
  const [placing, setPlacing]                   = useState(false);
  const [error, setError]                       = useState("");

  // Group cart items by caterer
  const catererGroups = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.caterer_id)) {
        map.set(item.caterer_id, { caterer_id: item.caterer_id, caterer_name: item.caterer_name, items: [] });
      }
      map.get(item.caterer_id).items.push(item);
    }
    return [...map.values()];
  }, [items]);

  // Fetch caterer payment profiles
  useEffect(() => {
    const uniqueIds = [...new Set(items.map((i) => i.caterer_id).filter(Boolean))];
    uniqueIds.forEach(async (id) => {
      try {
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res  = await fetch(`${BASE}/caterers/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCatererProfiles((prev) => ({ ...prev, [id]: data.caterer }));
        }
      } catch (_) {}
    });
  }, [items]);

  const unavailableItems = useMemo(
    () => items.filter((i) => i.is_available === false),
    [items]
  );

  const setPaymentField = (caterer_id, field, value) => {
    setPaymentInputs((prev) => ({
      ...prev,
      [caterer_id]: { ...(prev[caterer_id] || {}), [field]: value },
    }));
  };

  const handlePlaceOrder = async () => {
    if (!items.length) return;
    setPlacing(true);
    setError("");
    try {
      const payment_proofs = catererGroups
        .map((g) => ({
          caterer_id:             g.caterer_id,
          payment_screenshot_url: paymentInputs[g.caterer_id]?.screenshot_url || "",
          upi_reference:          paymentInputs[g.caterer_id]?.upi_ref || "",
        }))
        .filter((p) => p.payment_screenshot_url);

      await masterOrderService.createSplitOrder({
        items: items.map((i) => ({ food_item_id: i.food_item_id, quantity: i.quantity })),
        customer_lat:   customerCoords?.lat,
        customer_lng:   customerCoords?.lng,
        payment_proofs,
      });
      await clearCart();
      navigate("/customer/master-orders", { state: { justPlaced: true } });
    } catch (err) {
      setError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>Your cart is empty.</Typography>
          <Button variant="contained" onClick={() => navigate("/services/tiffins")}>Browse Food</Button>
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
            {unavailableItems.length === 1 ? "it" : "them"} before placing the order.
          </Alert>
        )}

        <Stack spacing={2.5}>
          {catererGroups.map((group) => {
            const profile    = catererProfiles[group.caterer_id] || {};
            const subtotal   = group.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
            const hasPayInfo = profile.upi_id || profile.qr_code_image_url || profile.bank_account_name;
            const inputs     = paymentInputs[group.caterer_id] || {};

            return (
              <Paper key={group.caterer_id} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, overflow: "hidden" }}>
                {/* Caterer header */}
                <Box sx={{ px: 2.5, py: 1.5, backgroundColor: brand.greenLight, borderBottom: `1px solid ${brand.border}` }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brand.orange }}>
                    {profile.businessName || profile.catererName || group.caterer_name}
                  </Typography>
                  {profile.businessName && profile.catererName && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>by {profile.catererName}</Typography>
                  )}
                </Box>

                {/* Items */}
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
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.food_name}</Typography>
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

                <Divider />

                {/* Payment info */}
                <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountBalanceWalletRoundedIcon sx={{ fontSize: 18, color: brand.orange }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Payment Details {inputs.screenshot_url ? "· Proof Added" : "· Optional"}
                      </Typography>
                      {inputs.screenshot_url && (
                        <Chip label="Proof Added" size="small" sx={{ backgroundColor: brand.greenLight, color: brand.green, fontWeight: 700, fontSize: "0.65rem" }} />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.5, pb: 2 }}>
                    {hasPayInfo ? (
                      <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, backgroundColor: brand.goldLight, border: `1px solid ${brand.gold}` }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#B8860B", display: "block", mb: 0.5 }}>
                          Pay via UPI / Bank Transfer
                        </Typography>
                        {profile.upi_id && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                            <QrCodeRoundedIcon sx={{ fontSize: 14, color: "#B8860B" }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>UPI: {profile.upi_id}</Typography>
                          </Box>
                        )}
                        {profile.payment_name && (
                          <Typography variant="caption" sx={{ color: "#B8860B" }}>Name: {profile.payment_name}</Typography>
                        )}
                        {profile.bank_account_name && (
                          <Typography variant="caption" sx={{ color: "#B8860B", display: "block" }}>
                            Bank: {profile.bank_account_name}
                          </Typography>
                        )}
                        {profile.qr_code_image_url && (
                          <Box sx={{ mt: 1 }}>
                            <img
                              src={profile.qr_code_image_url}
                              alt="QR Code"
                              style={{ maxWidth: 160, borderRadius: 8, border: `1px solid ${brand.border}` }}
                            />
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2, fontSize: "0.78rem" }}>
                        This caterer hasn't set up payment info yet. You can upload proof later.
                      </Alert>
                    )}

                    <Stack spacing={1.5}>
                      <TextField
                        size="small"
                        label="Payment Screenshot URL (optional)"
                        placeholder="https://..."
                        value={inputs.screenshot_url || ""}
                        onChange={(e) => setPaymentField(group.caterer_id, "screenshot_url", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        size="small"
                        label="UPI Transaction Reference (optional)"
                        placeholder="Transaction ID"
                        value={inputs.upi_ref || ""}
                        onChange={(e) => setPaymentField(group.caterer_id, "upi_ref", e.target.value)}
                        fullWidth
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            );
          })}

          {/* Order total + place button */}
          <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>
                ₹{Number(total).toFixed(2)}
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
              Payment proof is optional at checkout. You can submit it later from My Bookings.
            </Typography>

            <Button
              fullWidth variant="contained" size="large"
              onClick={handlePlaceOrder}
              disabled={placing || !items.length || unavailableItems.length > 0}
              startIcon={placing ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartCheckoutRoundedIcon />}
              sx={{ fontWeight: 700, py: 1.25 }}
            >
              {placing ? "Placing Order…" : `Place Order · ₹${Number(total).toFixed(2)}`}
            </Button>
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  );
}
