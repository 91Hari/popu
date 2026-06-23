import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, CircularProgress,
  Alert, Stack, Paper, Divider, IconButton, Tooltip, Chip, Collapse,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import DinnerDiningRoundedIcon         from "@mui/icons-material/DinnerDiningRounded";
import LocationOnRoundedIcon           from "@mui/icons-material/LocationOnRounded";
import ContentCopyRoundedIcon          from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon                from "@mui/icons-material/CheckRounded";
import QrCodeRoundedIcon               from "@mui/icons-material/QrCodeRounded";
import UploadFileRoundedIcon           from "@mui/icons-material/UploadFileRounded";
import CheckCircleRoundedIcon          from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineRoundedIcon        from "@mui/icons-material/DeleteOutlineRounded";
import LocalAtmRoundedIcon             from "@mui/icons-material/LocalAtmRounded";
import CreditCardRoundedIcon           from "@mui/icons-material/CreditCardRounded";
import HelpOutlineRoundedIcon          from "@mui/icons-material/HelpOutlineRounded";
import ExpandMoreRoundedIcon           from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon           from "@mui/icons-material/ExpandLessRounded";
import { useCart }             from "../../contexts/CartContext";
import AppLayout               from "../../components/AppLayout";
import QRCodeModal             from "../../components/QRCodeModal";
import { brand }               from "../../theme";
import { useCustomerGeo }      from "../../utils/geoUtils";
import api                     from "../../services/api";
import masterOrderService      from "../../services/masterOrderService";
import DirectionsWalkRoundedIcon   from "@mui/icons-material/DirectionsWalkRounded";
import LocalShippingRoundedIcon    from "@mui/icons-material/LocalShippingRounded";

const PROOF_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PROOF_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];

// Build UPI deep-link URI
function buildUpiLink(upiId, upiName, amount) {
  const pa = encodeURIComponent(upiId);
  const pn = encodeURIComponent(upiName || "");
  const am = Number(amount).toFixed(2);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR`;
}

// Detect mobile device
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function PhonePeBadge({ size = 22 }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #5A4EE8, #7B6CF0)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: `${size * 0.45}px`, lineHeight: 1 }}>Pe</Typography>
    </Box>
  );
}

export default function SplitCheckoutPage() {
  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();
  const { items, total, clearCart } = useCart();

  const [catererProfiles,  setCatererProfiles] = useState({});
  const [defaultAddress,   setDefaultAddress]  = useState(null);
  const [loading,          setLoading]         = useState(false);
  const [placing,          setPlacing]         = useState(false);
  const [error,            setError]           = useState("");
  const [copied,          setCopied]          = useState(null);
  const [proofFiles,      setProofFiles]      = useState({});
  const [qrModal,         setQrModal]         = useState({ open: false });
  const [paymentMethod,   setPaymentMethod]   = useState("ONLINE");
  const [pickupRec,       setPickupRec]       = useState(null);
  const [pickupLoading,   setPickupLoading]   = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState("DELIVERY");
  const [pickupTracked,   setPickupTracked]   = useState(false);
  const fileInputRefs = useRef({});

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

  useEffect(() => {
    api.request("/profile/addresses")
      .then((addrs) => {
        const addr = Array.isArray(addrs)
          ? (addrs.find((a) => a.is_default) || addrs[0] || null)
          : null;
        setDefaultAddress(addr);
      })
      .catch(() => {});
  }, []);

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

  // Caterers with any payment method (UPI or QR) — require screenshot from all of them
  const paymentEnabledIds = useMemo(() => {
    if (loading) return new Set();
    return new Set(
      catererGroups
        .filter((g) => {
          const p = catererProfiles[g.caterer_id];
          return p?.phonepe_id || p?.upi_id || p?.qr_code_image_url;
        })
        .map((g) => g.caterer_id)
    );
  }, [catererGroups, catererProfiles, loading]);

  const allProofsReady = useMemo(() => {
    if (paymentMethod === "COD") return true;
    if (paymentEnabledIds.size === 0) return true;
    return [...paymentEnabledIds].every((id) => !!proofFiles[id]);
  }, [paymentEnabledIds, proofFiles, paymentMethod]);

  const handleCopyUpi = (catererId, upiId) => {
    navigator.clipboard.writeText(upiId).catch(() => {});
    setCopied(catererId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleProofFile = (catererId, file) => {
    if (!file) return;
    if (!ACCEPTED_PROOF_TYPES.includes(file.type)) {
      setError("Only PNG, JPG, WEBP, or PDF files are accepted as payment proof.");
      return;
    }
    if (file.size > PROOF_MAX_BYTES) {
      setError("Payment proof must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProofFiles((prev) => ({ ...prev, [catererId]: { url: ev.target.result, fileName: file.name } }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProof = (catererId) => {
    setProofFiles((prev) => { const next = { ...prev }; delete next[catererId]; return next; });
  };

  // Fetch self-pickup recommendation for single-caterer orders
  useEffect(() => {
    if (catererGroups.length !== 1 || loading) return;
    // Use GPS coords if available, fall back to saved address coordinates
    const lat = customerCoords?.lat ?? defaultAddress?.latitude  ?? null;
    const lng = customerCoords?.lng ?? defaultAddress?.longitude ?? null;
    if (!lat || !lng) return;
    const group = catererGroups[0];
    const foodIds = group.items.map((i) => i.food_item_id).filter(Boolean);
    setPickupLoading(true);
    masterOrderService.getPickupRecommendation({
      caterer_id:    group.caterer_id,
      customer_lat:  lat,
      customer_lng:  lng,
      food_item_ids: foodIds,
    }).then((rec) => {
      setPickupRec(rec);
    }).catch(() => {
      setPickupRec({ show: false, reason: 'error' });
    }).finally(() => {
      setPickupLoading(false);
    });
  }, [catererGroups, loading, customerCoords, defaultAddress]);

  // Track SHOWN once when recommendation becomes visible
  useEffect(() => {
    if (!pickupRec?.show || pickupTracked || catererGroups.length !== 1) return;
    setPickupTracked(true);
    masterOrderService.trackPickupEvent({
      caterer_id:    catererGroups[0].caterer_id,
      event:         'SHOWN',
      distance_km:   pickupRec.distance_km,
      saving_amount: pickupRec.saving,
    }).catch(() => {});
  }, [pickupRec, pickupTracked, catererGroups]);

  // Self pickup requires advance payment — reset to ONLINE when selected
  useEffect(() => {
    if (fulfillmentType === 'SELF_PICKUP' && paymentMethod === 'COD') {
      setPaymentMethod('ONLINE');
    }
  }, [fulfillmentType, paymentMethod]);

  const handlePickupChoice = (choice) => {
    if (catererGroups.length !== 1) return;
    if (choice === fulfillmentType) return;
    setFulfillmentType(choice);
    if (choice === 'SELF_PICKUP') {
      masterOrderService.trackPickupEvent({
        caterer_id:    catererGroups[0].caterer_id,
        event:         'ACCEPTED',
        distance_km:   pickupRec?.distance_km,
        saving_amount: pickupRec?.saving,
      }).catch(() => {});
    } else {
      masterOrderService.trackPickupEvent({
        caterer_id:    catererGroups[0].caterer_id,
        event:         'REJECTED',
        distance_km:   pickupRec?.distance_km,
        saving_amount: pickupRec?.saving,
      }).catch(() => {});
    }
  };

  const [guideOpen,  setGuideOpen]  = useState({}); // { [caterer_id]: bool }

  const handlePlaceOrder = async () => {
    if (!items.length || unavailableItems.length > 0) return;
    if (!allProofsReady) {
      setError("Please upload payment proof for all caterers before placing your order.");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const payment_proofs = paymentMethod === "ONLINE"
        ? Object.entries(proofFiles).map(([caterer_id, data]) => ({
            caterer_id,
            payment_screenshot_url: data.url,
          }))
        : [];
      const masterOrder = await masterOrderService.createSplitOrder({
        items:             items.map((i) => ({ food_item_id: i.food_item_id, quantity: i.quantity })),
        customer_lat:      customerCoords?.lat ?? defaultAddress?.latitude  ?? null,
        customer_lng:      customerCoords?.lng ?? defaultAddress?.longitude ?? null,
        delivery_house_no: defaultAddress?.house_no  ?? null,
        delivery_street:   defaultAddress?.street    ?? null,
        delivery_landmark: defaultAddress?.landmark  ?? null,
        delivery_city:     defaultAddress?.city      ?? null,
        delivery_state:    defaultAddress?.state     ?? null,
        delivery_pincode:  defaultAddress?.pincode   ?? null,
        payment_method:    paymentMethod,
        payment_proofs,
        fulfillment_type:  fulfillmentType,
      });
      await clearCart();
      if (fulfillmentType === 'SELF_PICKUP' && masterOrder?.id) {
        navigate(`/customer/pickup/${masterOrder.id}`);
      } else {
        navigate("/customer/master-orders", { state: { justPlaced: true } });
      }
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

        {/* ── Delivering To ── */}
        {defaultAddress && (
          <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <LocationOnRoundedIcon sx={{ color: brand.gold, fontSize: 20, mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Delivering to
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25 }}>
                  {defaultAddress.full_name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.65, mt: 0.25 }}>
                  {[
                    defaultAddress.house_no,
                    defaultAddress.street,
                    defaultAddress.landmark,
                    defaultAddress.city,
                    [defaultAddress.state, defaultAddress.pincode].filter(Boolean).join(" — "),
                  ].filter(Boolean).join(", ")}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* ── Fulfillment Method ── always visible ── */}
        <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
            How would you like your order?
          </Typography>
          <Stack spacing={1.5}>

            {/* Home Delivery */}
            <Box
              onClick={() => { if (fulfillmentType !== 'DELIVERY') handlePickupChoice('DELIVERY'); }}
              sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, cursor: 'pointer',
                border: `2px solid ${fulfillmentType === 'DELIVERY' ? brand.orange : brand.border}`,
                backgroundColor: fulfillmentType === 'DELIVERY' ? brand.orangeLight : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <Box sx={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0, mt: 0.15,
                border: `2px solid ${fulfillmentType === 'DELIVERY' ? brand.orange : '#C4C4C4'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {fulfillmentType === 'DELIVERY' && (
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: brand.orange }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingRoundedIcon sx={{ fontSize: 17, color: brand.orange }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: brand.orange }}>Home Delivery</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Delivered to your address by a rider
                </Typography>
              </Box>
            </Box>

            {/* Self Pickup — three states: loading / eligible / disabled */}
            {catererGroups.length > 1 ? (
              /* Multi-caterer — always disabled */
              <Box sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2,
                border: `1px dashed ${brand.border}`, backgroundColor: '#FAFAFA',
              }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #D0D0D0', flexShrink: 0, mt: 0.15 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsWalkRoundedIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.disabled' }}>Self Pickup</Typography>
                    <Chip label="Multi-caterer" size="small" sx={{ fontSize: '0.6rem', fontWeight: 600, height: 18 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Self Pickup is available only when ordering from one caterer
                  </Typography>
                </Box>
              </Box>
            ) : pickupLoading ? (
              /* Checking eligibility */
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                border: `1px solid ${brand.border}`,
              }}>
                <CircularProgress size={16} sx={{ color: brand.orange, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Self Pickup</Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>Checking availability…</Typography>
                </Box>
              </Box>
            ) : pickupRec?.show ? (
              /* Eligible — selectable */
              <Box
                onClick={() => { if (fulfillmentType !== 'SELF_PICKUP') handlePickupChoice('SELF_PICKUP'); }}
                sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.75, borderRadius: 2, cursor: 'pointer',
                  border: `2px solid ${fulfillmentType === 'SELF_PICKUP' ? '#2E7D32' : '#81C784'}`,
                  backgroundColor: fulfillmentType === 'SELF_PICKUP' ? '#E8F5E9' : '#F9FFF9',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
                }}
              >
                <Box sx={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, mt: 0.15,
                  border: `2px solid ${fulfillmentType === 'SELF_PICKUP' ? '#2E7D32' : '#C4C4C4'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {fulfillmentType === 'SELF_PICKUP' && (
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2E7D32' }} />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <DirectionsWalkRoundedIcon sx={{ fontSize: 17, color: '#2E7D32' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2E7D32' }}>Self Pickup</Typography>
                    {pickupRec.saving > 0 && (
                      <Chip label={`Save ₹${Math.round(pickupRec.saving)}`} size="small"
                        sx={{ backgroundColor: '#2E7D32', color: '#fff', fontWeight: 700, fontSize: '0.6rem', height: 18 }} />
                    )}
                    <Chip label={pickupRec.distance_label} size="small"
                      sx={{ fontSize: '0.6rem', fontWeight: 600, height: 18, backgroundColor: '#E8F5E9', color: '#2E7D32' }} />
                  </Box>
                  {fulfillmentType === 'SELF_PICKUP' ? (
                    <Box sx={{ mt: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                        You selected Self Pickup! 🎉
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#388E3C', display: 'block', mt: 0.25 }}>
                        Pickup from: {catererGroups[0]?.caterer_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Ready in ~{pickupRec.prep_time} min · {pickupRec.distance_label} away
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 0.75 }}>
                      <Typography variant="caption" sx={{ color: '#388E3C', display: 'block', fontStyle: 'italic', mb: 0.75 }}>
                        {pickupRec.message}
                      </Typography>
                      <Stack spacing={0.35}>
                        {pickupRec.saving > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <CheckRoundedIcon sx={{ fontSize: 13, color: '#2E7D32', flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                              Save ₹{Math.round(pickupRec.saving)} on delivery charges
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <CheckRoundedIcon sx={{ fontSize: 13, color: '#2E7D32', flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ color: '#388E3C', fontWeight: 600 }}>
                            Ready in ~{pickupRec.prep_time} min
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <CheckRoundedIcon sx={{ fontSize: 13, color: '#2E7D32', flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ color: '#388E3C', fontWeight: 600 }}>
                            No delivery waiting
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : pickupRec && !pickupRec.show ? (
              /* Not eligible — show reason, disabled */
              <Box sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2,
                border: `1px dashed ${brand.border}`, backgroundColor: '#FAFAFA',
              }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #D0D0D0', flexShrink: 0, mt: 0.15 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsWalkRoundedIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.disabled' }}>Self Pickup</Typography>
                    <Chip label="Unavailable" size="small" sx={{ fontSize: '0.6rem', fontWeight: 600, height: 18 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {pickupRec.reason === 'too_far'
                      ? `Caterer is ${pickupRec.distance_km?.toFixed(1)} km away (max 3 km for pickup)`
                      : pickupRec.reason === 'no_caterer_coords'
                      ? 'Caterer location not set — contact support'
                      : pickupRec.reason === 'prep_too_long'
                      ? 'Preparation time exceeds 60 min for pickup'
                      : 'Not available for this order'}
                  </Typography>
                </Box>
              </Box>
            ) : null}

          </Stack>
        </Paper>

        {unavailableItems.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {unavailableItems.map((i) => `"${i.food_name}"`).join(", ")}{" "}
            {unavailableItems.length === 1 ? "is" : "are"} no longer available.
            Go back and remove {unavailableItems.length === 1 ? "it" : "them"} before proceeding.
          </Alert>
        )}

        {/* ── Payment Method Selection ── */}
        <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5, mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Payment Method</Typography>
          <ToggleButtonGroup
            value={paymentMethod}
            exclusive
            onChange={(_, val) => { if (val) setPaymentMethod(val); }}
            fullWidth
            size="small"
            sx={{ gap: 1.5 }}
          >
            <ToggleButton
              value="ONLINE"
              sx={{
                flex: 1, borderRadius: "10px !important", border: `1.5px solid ${brand.border} !important`,
                fontWeight: 700, textTransform: "none", py: 1.25, gap: 1,
                "&.Mui-selected": {
                  backgroundColor: brand.orangeLight,
                  borderColor: `${brand.orange} !important`,
                  color: brand.orange,
                },
              }}
            >
              <CreditCardRoundedIcon sx={{ fontSize: 18 }} />
              Online Payment
            </ToggleButton>
            <ToggleButton
              value="COD"
              disabled={fulfillmentType === 'SELF_PICKUP'}
              sx={{
                flex: 1, borderRadius: "10px !important", border: `1.5px solid ${brand.border} !important`,
                fontWeight: 700, textTransform: "none", py: 1.25, gap: 1,
                "&.Mui-selected": {
                  backgroundColor: "#E8F5E9",
                  borderColor: `#2E7D32 !important`,
                  color: "#2E7D32",
                },
                "&.Mui-disabled": { opacity: 0.4 },
              }}
            >
              <LocalAtmRoundedIcon sx={{ fontSize: 18 }} />
              Cash on Delivery
            </ToggleButton>
          </ToggleButtonGroup>

          {fulfillmentType === 'SELF_PICKUP' && (
            <Alert severity="info" icon={<DirectionsWalkRoundedIcon fontSize="inherit" />}
              sx={{ mt: 1.5, fontSize: "0.8rem", py: 0.75, borderRadius: 2 }}>
              Self pickup requires advance payment to confirm your order.
            </Alert>
          )}
          {paymentMethod === "COD" && fulfillmentType !== 'SELF_PICKUP' && (
            <Alert severity="success" icon={<LocalAtmRoundedIcon fontSize="inherit" />}
              sx={{ mt: 1.5, fontSize: "0.8rem", py: 0.75, borderRadius: 2 }}>
              Pay the rider in cash when your order arrives. Your rider will show the caterer's QR for payment.
            </Alert>
          )}
          {paymentMethod === "ONLINE" && fulfillmentType !== 'SELF_PICKUP' && (
            <Alert severity="info" icon={<CreditCardRoundedIcon fontSize="inherit" />}
              sx={{ mt: 1.5, fontSize: "0.8rem", py: 0.75, borderRadius: 2 }}>
              Pay each caterer online using UPI or QR, then upload your payment screenshot below.
            </Alert>
          )}
        </Paper>

        <Stack spacing={2.5}>
          {catererGroups.map((group) => {
            const profile  = catererProfiles[group.caterer_id];
            const upiId    = profile?.phonepe_id || profile?.upi_id || null;
            const upiName  = profile?.payment_name || group.caterer_name || "";
            const qrUrl    = profile?.qr_code_image_url || null;
            const hasPayment = upiId || qrUrl;
            const subtotal = group.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
            const proof    = proofFiles[group.caterer_id];
            const needsProof = !loading && hasPayment && !proof;
            const upiLink  = upiId ? buildUpiLink(upiId, upiName, subtotal) : null;

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
                  {/* Items list */}
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

                  {/* ── Payment section ── */}
                  {paymentMethod === "COD" ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 1.5, backgroundColor: "#E8F5E9", border: "1px solid #A5D6A7" }}>
                      <LocalAtmRoundedIcon sx={{ fontSize: 18, color: "#2E7D32", flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: "#2E7D32", fontWeight: 700 }}>
                        Cash on Delivery — pay the rider when your order arrives.
                      </Typography>
                    </Box>
                  ) : loading && !profile ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                      <CircularProgress size={14} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Loading payment info…</Typography>
                    </Box>
                  ) : !hasPayment ? (
                    <Alert severity="warning" sx={{ fontSize: "0.8rem", py: 0.5 }}>
                      {group.caterer_name} hasn't added payment details yet. Contact them directly to arrange payment.
                    </Alert>
                  ) : (
                    <Box>
                      {/* UPI deep-link buttons hidden — re-enable when merchant UPI IDs are set up */}

                      {/* ── QR + Copy row ── */}
                      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                        {qrUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<QrCodeRoundedIcon />}
                            onClick={() => setQrModal({
                              open: true, qrUrl, upiId, upiName,
                              catererName: group.caterer_name, amount: subtotal,
                            })}
                            sx={{
                              fontWeight: 600, textTransform: "none",
                              borderColor: brand.border, color: "text.secondary",
                              "&:hover": { borderColor: brand.orange, color: brand.orange },
                            }}
                          >
                            Show QR Code
                          </Button>
                        )}

                        {upiId && (
                          <Box
                            onClick={() => handleCopyUpi(group.caterer_id, upiId)}
                            sx={{
                              display: "flex", alignItems: "center", gap: 1,
                              px: 1.5, py: 0.5, borderRadius: 1.5, cursor: "pointer", flexShrink: 0,
                              border: `1px solid ${copied === group.caterer_id ? "#2e7d32" : brand.border}`,
                              backgroundColor: copied === group.caterer_id ? "#f1f8f1" : "#faf8ff",
                              transition: "all 0.18s",
                            }}
                          >
                            <PhonePeBadge size={16} />
                            <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8rem", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {upiId}
                            </Typography>
                            <Tooltip title={copied === group.caterer_id ? "Copied!" : "Copy UPI ID"}>
                              {copied === group.caterer_id
                                ? <CheckRoundedIcon sx={{ fontSize: 14, color: "#2e7d32" }} />
                                : <ContentCopyRoundedIcon sx={{ fontSize: 14, color: "#5A4EE8" }} />}
                            </Tooltip>
                          </Box>
                        )}
                      </Stack>

                      {/* Mobile tip */}
                      {!isMobileDevice() && upiLink && (
                        <Alert severity="info" icon={false} sx={{ mb: 1.5, fontSize: "0.75rem", py: 0.5 }}>
                          On a laptop? Use <strong>Show QR Code</strong> to scan from your phone, or copy the UPI ID.
                        </Alert>
                      )}

                      {/* Pay to info */}
                      <Box sx={{
                        display: "flex", alignItems: "center", gap: 1,
                        px: 1.5, py: 1, mb: 1.5, borderRadius: 1.5,
                        backgroundColor: brand.orangeLight, border: `1px solid ${brand.border}`,
                      }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.2 }}>
                            Pay ₹{subtotal.toFixed(2)} to
                          </Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: brand.orange }}>
                            {upiName}
                          </Typography>
                          {upiId && (
                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                              {upiId}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* ── PhonePe payment guide ── */}
                      {upiId && (
                        <Box sx={{ mb: 1.5 }}>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<HelpOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                            endIcon={guideOpen[group.caterer_id]
                              ? <ExpandLessRoundedIcon sx={{ fontSize: 16 }} />
                              : <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setGuideOpen((g) => ({ ...g, [group.caterer_id]: !g[group.caterer_id] }))}
                            sx={{
                              fontWeight: 700, textTransform: "none", fontSize: "0.8rem",
                              color: "#5A4EE8", px: 0,
                              "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                            }}
                          >
                            How to pay using PhonePe?
                          </Button>

                          <Collapse in={!!guideOpen[group.caterer_id]}>
                            <Box sx={{
                              mt: 1, p: 1.5, borderRadius: 2,
                              backgroundColor: "#F5F3FF",
                              border: "1px solid #D8D0F7",
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: "#5A4EE8", display: "block", mb: 1.25 }}>
                                Follow these steps in PhonePe app
                              </Typography>

                              {[
                                {
                                  label: "Open PhonePe → Money Transfers",
                                  detail: 'Tap "To Bank & Self A/c" on the home screen',
                                },
                                {
                                  label: "Tap 'To UPI ID or Number'",
                                  detail: "Choose 'Transfer to any UPI app' option",
                                },
                                {
                                  label: 'Tap "+ UPI ID / Number" button',
                                  detail: "Add a new UPI recipient",
                                },
                                {
                                  label: "Paste the UPI ID below → Proceed",
                                  detail: `PhonePe will verify and show the account holder name`,
                                },
                              ].map((step, i) => (
                                <Box key={i} sx={{ display: "flex", gap: 1.25, mb: i < 3 ? 1 : 0 }}>
                                  <Box sx={{
                                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                    background: "linear-gradient(135deg, #5A4EE8, #7B6CF0)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}>
                                    <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.65rem", lineHeight: 1 }}>
                                      {i + 1}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#3D2EA0", display: "block", lineHeight: 1.4 }}>
                                      {step.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.4 }}>
                                      {step.detail}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}

                              {/* Inline copy inside guide */}
                              <Box
                                onClick={() => handleCopyUpi(group.caterer_id, upiId)}
                                sx={{
                                  mt: 1.25, display: "flex", alignItems: "center", gap: 1,
                                  p: 1, borderRadius: 1.5, cursor: "pointer",
                                  border: `1.5px solid ${copied === group.caterer_id ? "#2e7d32" : "#C5B9F7"}`,
                                  backgroundColor: copied === group.caterer_id ? "#f1f8f1" : "#EDE9FE",
                                  transition: "all 0.18s",
                                }}
                              >
                                <PhonePeBadge size={18} />
                                <Typography sx={{ fontFamily: "monospace", fontWeight: 800, fontSize: "0.88rem", flex: 1, color: "#3D2EA0" }}>
                                  {upiId}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  {copied === group.caterer_id
                                    ? <CheckRoundedIcon sx={{ fontSize: 15, color: "#2e7d32" }} />
                                    : <ContentCopyRoundedIcon sx={{ fontSize: 15, color: "#5A4EE8" }} />}
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: copied === group.caterer_id ? "#2e7d32" : "#5A4EE8" }}>
                                    {copied === group.caterer_id ? "Copied!" : "Copy UPI ID"}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Collapse>
                        </Box>
                      )}

                      {/* ── Screenshot upload ── */}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        hidden
                        ref={(el) => { fileInputRefs.current[group.caterer_id] = el; }}
                        onChange={(e) => {
                          handleProofFile(group.caterer_id, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />

                      {proof ? (
                        <Box sx={{
                          display: "flex", alignItems: "center", gap: 1.5,
                          p: 1.25, borderRadius: 2,
                          border: "2px solid #2e7d32", backgroundColor: "#f1f8f1",
                        }}>
                          <CheckCircleRoundedIcon sx={{ color: "#2e7d32", fontSize: 22, flexShrink: 0 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#2e7d32", display: "block" }}>
                              Payment proof uploaded
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {proof.fileName}
                            </Typography>
                          </Box>
                          <Tooltip title="Remove and re-upload">
                            <IconButton size="small" onClick={() => handleRemoveProof(group.caterer_id)}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box
                          onClick={() => fileInputRefs.current[group.caterer_id]?.click()}
                          sx={{
                            border: `2px dashed ${needsProof ? brand.orange : brand.border}`,
                            borderRadius: 2, p: 2, textAlign: "center", cursor: "pointer",
                            backgroundColor: needsProof ? brand.orangeLight : "transparent",
                            "&:hover": { borderColor: brand.orange, backgroundColor: brand.orangeLight },
                            transition: "all 0.15s",
                          }}
                        >
                          <UploadFileRoundedIcon sx={{ fontSize: 28, color: needsProof ? brand.orange : brand.border, mb: 0.5 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: needsProof ? brand.orange : "text.secondary" }}>
                            Upload Payment Screenshot
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>
                            PNG / JPG / WEBP / PDF · Max 5 MB
                          </Typography>
                          {needsProof && (
                            <Chip label="Required before placing order" size="small"
                              sx={{ mt: 0.75, backgroundColor: brand.orange, color: "#fff", fontWeight: 700, fontSize: "0.65rem" }} />
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}

          {/* ── Total + Place Order ── */}
          <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>
                ₹{Number(total).toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {paymentMethod === "COD" ? (
              <Alert severity="success" icon={<LocalAtmRoundedIcon fontSize="inherit" />} sx={{ mb: 2, fontSize: "0.8rem" }}>
                Cash on Delivery — no upfront payment needed. Pay the rider when your food arrives.
              </Alert>
            ) : !loading && paymentEnabledIds.size > 0 ? (
              <Alert severity={allProofsReady ? "success" : "warning"} sx={{ mb: 2, fontSize: "0.8rem" }}>
                {allProofsReady
                  ? "Payment proof uploaded for all caterers. Tap Place Order to confirm."
                  : "Complete payment for each caterer using PhonePe or UPI, then upload your payment screenshot."}
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 2, fontSize: "0.8rem" }}>
                Pay each caterer via their UPI link above, then tap <strong>Place Order</strong> to confirm.
              </Alert>
            )}

            <Button
              fullWidth variant="contained" size="large"
              onClick={handlePlaceOrder}
              disabled={placing || !items.length || unavailableItems.length > 0 || (!loading && !allProofsReady && paymentEnabledIds.size > 0 && paymentMethod === "ONLINE")}
              startIcon={placing ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ fontWeight: 700, py: 1.4 }}
            >
              {placing ? "Placing Order…" : "Place Order"}
            </Button>

            {paymentMethod === "ONLINE" && !loading && !allProofsReady && paymentEnabledIds.size > 0 && (
              <Typography variant="caption" sx={{ color: brand.orange, display: "block", mt: 1, textAlign: "center", fontWeight: 600 }}>
                Upload payment proof for all caterers to continue
              </Typography>
            )}

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1.5, textAlign: "center" }}>
              Order is sent to caterers after you tap Place Order.
            </Typography>
          </Paper>
        </Stack>
      </Container>

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrModal.open}
        onClose={() => setQrModal({ open: false })}
        qrUrl={qrModal.qrUrl}
        upiId={qrModal.upiId}
        upiName={qrModal.upiName}
        catererName={qrModal.catererName}
        amount={qrModal.amount}
      />
    </AppLayout>
  );
}
