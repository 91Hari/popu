import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, CircularProgress,
  Alert, Stack, Paper, Divider, IconButton, Tooltip,
} from "@mui/material";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import DinnerDiningRoundedIcon         from "@mui/icons-material/DinnerDiningRounded";
import ContentCopyRoundedIcon          from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon                from "@mui/icons-material/CheckRounded";
import { useCart }        from "../../contexts/CartContext";
import AppLayout          from "../../components/AppLayout";
import { brand }          from "../../theme";
import { useCustomerGeo } from "../../utils/geoUtils";
import api                from "../../services/api";

function PhonePeBadge() {
  return (
    <Box sx={{
      width: 22, height: 22, borderRadius: "50%",
      background: "linear-gradient(135deg, #5A4EE8, #7B6CF0)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.55rem", lineHeight: 1 }}>Pe</Typography>
    </Box>
  );
}


export default function SplitCheckoutPage() {
  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();
  const { items, total, clearCart } = useCart();

  const [catererProfiles, setCatererProfiles] = useState({});
  const [loading,         setLoading]         = useState(false);
  const [placing,         setPlacing]         = useState(false);
  const [error,           setError]           = useState("");
  const [copied,          setCopied]          = useState(null); // caterer_id being copied

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

  const unavailableItems = useMemo(() => items.filter((i) => i.is_available === false), [items]);

  // Fetch caterer profiles to get UPI IDs
  useEffect(() => {
    const ids = [...new Set(items.map((i) => i.caterer_id))];
    if (!ids.length) return;
    setLoading(true);
    Promise.all(ids.map((id) => api.request(`/caterers/${id}`).catch(() => null)))
      .then((results) => {
        const map = {};
        results.forEach((r) => { if (r?.caterer) map[r.caterer.id] = r.caterer; });
        setCatererProfiles(map);
      })
      .finally(() => setLoading(false));
  }, [items]);

  const handleCopyUpi = (catererId, upiId) => {
    navigator.clipboard.writeText(upiId).catch(() => {});
    setCopied(catererId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePlaceOrder = async () => {
    if (!items.length || unavailableItems.length > 0) return;
    setPlacing(true);
    setError("");
    try {
      await api.request("/checkout/split-order", {
        method: "POST",
        body: JSON.stringify({
          items:        items.map((i) => ({ food_item_id: i.food_item_id, quantity: i.quantity })),
          customer_lat: customerCoords?.lat ?? null,
          customer_lng: customerCoords?.lng ?? null,
        }),
      });
      await clearCart();
      navigate("/customer/master-orders", { state: { justPlaced: true } });
    } catch (err) {
      setError(err?.message || "Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>Your cart is empty.</Typography>
          <Button variant="contained" onClick={() => navigate("/services/food-marketplace")}>Browse Food</Button>
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

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        {unavailableItems.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {unavailableItems.map((i) => `"${i.food_name}"`).join(", ")} {unavailableItems.length === 1 ? "is" : "are"} no longer available.
            Go back and remove {unavailableItems.length === 1 ? "it" : "them"} before proceeding.
          </Alert>
        )}

        <Stack spacing={2.5}>
          {catererGroups.map((group) => {
            const profile  = catererProfiles[group.caterer_id];
            const upiId    = profile?.phonepe_id || profile?.upi_id || null;
            const subtotal = group.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

            return (
              <Paper key={group.caterer_id} elevation={0}
                sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, overflow: "hidden" }}>
                {/* Caterer header */}
                <Box sx={{ px: 2.5, py: 1.5, backgroundColor: brand.greenLight, borderBottom: `1px solid ${brand.border}` }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brand.orange }}>
                    {group.caterer_name}
                  </Typography>
                </Box>

                <Box sx={{ px: 2.5, py: 1.5 }}>
                  {/* Items */}
                  <Stack spacing={1} sx={{ mb: 1.5 }}>
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

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                      Subtotal: ₹{subtotal.toFixed(2)}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Payment section */}
                  {loading && !profile ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                      <CircularProgress size={14} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Loading payment info…</Typography>
                    </Box>
                  ) : upiId ? (
                    <Box>
                      {/* Step instructions */}
                      <Box sx={{
                        mb: 1.5, p: 1.5, borderRadius: 2,
                        backgroundColor: "#f3f0ff", border: "1px solid #d8d0f7",
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <PhonePeBadge />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#5A4EE8" }}>
                            Pay via PhonePe
                          </Typography>
                        </Box>
                        <Stack spacing={0.4}>
                          {[
                            "Open PhonePe → Send Money",
                            `Enter the UPI ID below`,
                            `Pay ₹${subtotal.toFixed(2)} to ${group.caterer_name}`,
                          ].map((step, i) => (
                            <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                              <Typography variant="caption" sx={{
                                fontWeight: 800, color: "#5A4EE8", minWidth: 16, lineHeight: 1.6,
                              }}>{i + 1}.</Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                                {step}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      {/* UPI ID — big copy target */}
                      <Box sx={{
                        display: "flex", alignItems: "center", gap: 1,
                        p: 1.5, borderRadius: 2,
                        border: `2px solid ${copied === group.caterer_id ? "#2e7d32" : "#e8e0f7"}`,
                        backgroundColor: copied === group.caterer_id ? "#f1f8f1" : "#faf8ff",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                        onClick={() => handleCopyUpi(group.caterer_id, upiId)}
                      >
                        <PhonePeBadge />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1 }}>
                            UPI ID
                          </Typography>
                          <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", letterSpacing: 0.3 }}>
                            {upiId}
                          </Typography>
                        </Box>
                        <Tooltip title={copied === group.caterer_id ? "Copied!" : "Tap to copy"}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {copied === group.caterer_id
                              ? <CheckRoundedIcon sx={{ fontSize: 18, color: "#2e7d32" }} />
                              : <ContentCopyRoundedIcon sx={{ fontSize: 18, color: "#5A4EE8" }} />}
                            <Typography variant="caption" sx={{
                              color: copied === group.caterer_id ? "#2e7d32" : "#5A4EE8",
                              fontWeight: 700,
                            }}>
                              {copied === group.caterer_id ? "Copied!" : "Copy"}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="warning" sx={{ fontSize: "0.8rem", py: 0.5 }}>
                      {group.caterer_name} hasn't added a UPI ID yet. Contact them directly to arrange payment.
                    </Alert>
                  )}
                </Box>
              </Paper>
            );
          })}

          {/* Total + Place Order */}
          <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>
                ₹{Number(total).toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Alert severity="info" sx={{ mb: 2, fontSize: "0.8rem" }}>
              Pay each caterer via their PhonePe link above, then tap <strong>Place Order</strong> to confirm.
            </Alert>

            <Button
              fullWidth variant="contained" size="large"
              onClick={handlePlaceOrder}
              disabled={placing || !items.length || unavailableItems.length > 0}
              startIcon={placing ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ fontWeight: 700, py: 1.4 }}
            >
              {placing ? "Placing Order…" : "Place Order"}
            </Button>

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1.5, textAlign: "center" }}>
              Order is sent to caterers after you tap Place Order.
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  );
}
