import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Button,
  CircularProgress, Alert, TextField, Divider, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import CheckCircleRoundedIcon  from "@mui/icons-material/CheckCircleRounded";
import TwoWheelerRoundedIcon   from "@mui/icons-material/TwoWheelerRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import PersonRoundedIcon       from "@mui/icons-material/PersonRounded";
import LocationOnRoundedIcon   from "@mui/icons-material/LocationOnRounded";
import LocalAtmRoundedIcon     from "@mui/icons-material/LocalAtmRounded";
import GpsFixedRoundedIcon     from "@mui/icons-material/GpsFixedRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import riderService from "../../services/riderService";

export default function RiderDeliveryPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [order, setOrder]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [code, setCode]                 = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [startingDelivery, setStartingDelivery] = useState(false);
  const [done, setDone]                 = useState(false);
  const [codDialog, setCodDialog]       = useState(false);
  const [confirmingCod, setConfirmingCod] = useState(false);
  const [gpsActive, setGpsActive]       = useState(false);
  const watchIdRef                      = useRef(null);
  const lastPushRef                     = useRef(0);
  const riderPosRef                     = useRef(null);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const data = await riderService.lookupOrder(id);
      setOrder(data);
    } catch (err) {
      setError(err?.message || "Failed to load order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  // Pre-load rider GPS using Capacitor on Android, browser API as fallback
  useEffect(() => {
    let capWatchId = null;
    let browserWatchId = null;

    async function startPreload() {
      try {
        const { Geolocation } = await import("@capacitor/geolocation");
        await Geolocation.requestPermissions();
        capWatchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (pos, err) => {
            if (err) return;
            riderPosRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          }
        );
      } catch {
        if (!navigator.geolocation) return;
        browserWatchId = navigator.geolocation.watchPosition(
          (pos) => { riderPosRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
          (err) => console.warn("[Rider GPS pre-load]", err.message),
          { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 }
        );
      }
    }

    startPreload();
    return () => {
      if (capWatchId !== null) {
        import("@capacitor/geolocation").then(({ Geolocation }) =>
          Geolocation.clearWatch({ id: capWatchId })
        ).catch(() => {});
      }
      if (browserWatchId !== null) {
        navigator.geolocation?.clearWatch(browserWatchId);
      }
    };
  }, []);

  // GPS tracking — active only while status = OUT_FOR_DELIVERY
  useEffect(() => {
    if (order?.status !== "OUT_FOR_DELIVERY") {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setGpsActive(false);
      }
      return;
    }

    const handlePosition = (lat, lng) => {
      const now = Date.now();
      if (now - lastPushRef.current < 10_000) return;
      lastPushRef.current = now;
      riderService.pushLocation({ latitude: lat, longitude: lng, order_id: id }).catch(() => {});
    };

    let capWatchId = null;
    async function startCapWatch() {
      try {
        const { Geolocation } = await import("@capacitor/geolocation");
        capWatchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (pos, err) => { if (!err) handlePosition(pos.coords.latitude, pos.coords.longitude); }
        );
        watchIdRef.current = capWatchId;
        setGpsActive(true);
      } catch {
        if (!navigator.geolocation) return;
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => handlePosition(pos.coords.latitude, pos.coords.longitude),
          (err) => console.warn("[GPS]", err.message),
          { enableHighAccuracy: true, timeout: 15_000, maximumAge: 5_000 }
        );
        setGpsActive(true);
      }
    }

    startCapWatch();

    return () => {
      if (capWatchId !== null) {
        import("@capacitor/geolocation").then(({ Geolocation }) =>
          Geolocation.clearWatch({ id: capWatchId })
        ).catch(() => {});
      } else if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      setGpsActive(false);
    };
  }, [order?.status]);

  const handleStart = async () => {
    setStartingDelivery(true);

    // Open navigation synchronously inside the click event so mobile browsers
    // (iOS Safari, Android Chrome) don't treat it as a blocked popup.
    const destLat  = order?.customer_lat;
    const destLng  = order?.customer_lng;
    const riderPos = riderPosRef.current;

    // Build destination: prefer precise coordinates, fall back to address text
    const hasCoords = destLat && destLng;
    const addrText  = [
      order?.delivery_house_no,
      order?.delivery_street,
      order?.delivery_city,
      order?.delivery_state,
      order?.delivery_pincode,
    ].filter(Boolean).join(", ");

    const dest = hasCoords
      ? `${destLat},${destLng}`
      : addrText ? encodeURIComponent(addrText) : null;

    if (dest) {
      const origin = riderPos ? `&origin=${riderPos.lat},${riderPos.lng}` : "";
      window.open(
        `https://www.google.com/maps/dir/?api=1${origin}&destination=${dest}&travelmode=driving`,
        "_blank",
        "noopener,noreferrer"
      );
    }

    try {
      await riderService.startDelivery(id);
      await loadOrder();
    } catch (err) {
      setError(err?.message || "Failed to start delivery.");
    } finally {
      setStartingDelivery(false);
    }
  };

  const handleConfirmCod = async () => {
    setConfirmingCod(true);
    try {
      await riderService.confirmCodPayment(id);
      setCodDialog(false);
      await loadOrder();
    } catch (err) {
      setError(err?.message || "Failed to confirm payment.");
    } finally {
      setConfirmingCod(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (code.length !== 6) return;
    setSubmitting(true);
    setError("");
    try {
      await riderService.confirmDelivery(id, code);
      setDone(true);
    } catch (err) {
      setError(err?.message || "Invalid code. Please check with the customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const isCod            = order?.payment_method === "COD";
  const codPaymentPaid   = order?.payment_status === "PAID";
  const codPaymentPending = isCod && !codPaymentPaid;

  if (done) {
    return (
      <AppLayout>
        <Container maxWidth="sm" sx={{ pt: 6, pb: 6, textAlign: "center" }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 80, color: brand.orange, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Delivery Complete!</Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
            Order #{id.slice(0, 8).toUpperCase()} has been marked as delivered.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/rider")}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700 }}
          >
            Back to Dashboard
          </Button>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <TwoWheelerRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Delivery</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : error && !order ? (
          <Alert severity="error">{error}</Alert>
        ) : order ? (
          <>
            {/* ── Order summary card ── */}
            <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, mb: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                      Order #{order.id?.slice(0, 8).toUpperCase()}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={order.status?.replace(/_/g, " ")}
                        size="small"
                        color={order.status === "OUT_FOR_DELIVERY" ? "warning" : "info"}
                        sx={{ fontWeight: 700 }}
                      />
                      {isCod && (
                        <Chip
                          icon={<LocalAtmRoundedIcon sx={{ fontSize: 13 }} />}
                          label="Cash on Delivery"
                          size="small"
                          sx={{ fontWeight: 700, backgroundColor: "#E8F5E9", color: "#2E7D32" }}
                        />
                      )}
                      {gpsActive && (
                        <Chip
                          icon={<GpsFixedRoundedIcon sx={{ fontSize: 13 }} />}
                          label="GPS Active"
                          size="small"
                          sx={{
                            fontWeight: 700, backgroundColor: "#E3F2FD", color: "#1565C0",
                            animation: "gps-pulse 2s ease-in-out infinite",
                            "@keyframes gps-pulse": {
                              "0%, 100%": { opacity: 1 },
                              "50%":      { opacity: 0.55 },
                            },
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange }}>
                    ₹{Number(order.subtotal || 0).toFixed(2)}
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 1.5 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <PersonRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.customer_name}</Typography>
                    {order.customer_phone && (
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{order.customer_phone}</Typography>
                    )}
                  </Box>
                </Box>

                {/* ── Delivery Address ── */}
                {(() => {
                  const hasText   = order.delivery_house_no || order.delivery_street || order.delivery_city;
                  const hasCoords = order.delivery_lat || order.delivery_lng || order.customer_lat || order.customer_lng;
                  if (!hasText && !hasCoords) return null;

                  const addrLine = [
                    order.delivery_house_no,
                    order.delivery_street,
                    order.delivery_landmark,
                    order.delivery_city,
                    [order.delivery_state, order.delivery_pincode].filter(Boolean).join(" — "),
                  ].filter(Boolean).join(", ");

                  return (
                    <Box
                      sx={{
                        display: "flex", alignItems: "flex-start", gap: 1,
                        mb: 1.5, p: 1.25,
                        backgroundColor: brand.greenLight,
                        borderRadius: 1.5,
                        border: `1px solid ${brand.border}`,
                      }}
                    >
                      <LocationOnRoundedIcon sx={{ fontSize: 16, color: brand.orange, mt: 0.2, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: brand.orange, display: "block", mb: 0.25 }}>
                          Delivery Address
                        </Typography>
                        {hasText ? (
                          <Typography variant="caption" sx={{ color: "text.primary", lineHeight: 1.7, display: "block" }}>
                            {addrLine}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            Address not saved — GPS coordinates available for navigation.
                          </Typography>
                        )}
                        {hasCoords && (
                          <Typography variant="caption" sx={{ color: brand.orange, fontWeight: 600, display: "block", mt: 0.5 }}>
                            📍 Navigation opens automatically on Start Delivery
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })()}

                {Array.isArray(order.items) && order.items.length > 0 && (
                  <Stack spacing={0.5}>
                    {order.items.map((it, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <DinnerDiningRoundedIcon sx={{ fontSize: 13, color: brand.orange }} />
                        <Typography variant="caption">
                          {it.food_name} × {it.quantity}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* ── COD Payment Collection section ── */}
            {isCod && order.status === "OUT_FOR_DELIVERY" && (
              <Card elevation={0} sx={{
                border: `2px solid ${codPaymentPaid ? "#2E7D32" : "#E65100"}`,
                borderRadius: 2, mb: 2,
                backgroundColor: codPaymentPaid ? "#F1F8F1" : "#FFF8F5",
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <LocalAtmRoundedIcon sx={{ color: codPaymentPaid ? "#2E7D32" : "#E65100" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: codPaymentPaid ? "#2E7D32" : "#E65100" }}>
                      {codPaymentPaid ? "Payment Collected ✓" : "Payment Collection Required"}
                    </Typography>
                  </Box>

                  {!codPaymentPaid && (
                    <>
                      <Box sx={{ p: 1.5, mb: 1.5, borderRadius: 1.5, backgroundColor: "#FFF3E0", border: "1px solid #FFB74D" }}>
                        <Typography variant="caption" sx={{ color: "#E65100", display: "block", fontWeight: 700, mb: 0.25 }}>
                          Amount to Collect
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: "#E65100" }}>
                          ₹{Number(order.subtotal || 0).toFixed(2)}
                        </Typography>
                      </Box>

                      {/* Caterer QR code */}
                      {order.caterer_qr_url && (
                        <Box sx={{ mb: 1.5, textAlign: "center" }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.75 }}>
                            Show this QR code to the customer
                          </Typography>
                          <Box
                            component="img"
                            src={order.caterer_qr_url}
                            alt="Caterer QR"
                            sx={{
                              width: 180, height: 180, objectFit: "contain",
                              border: `2px solid ${brand.border}`, borderRadius: 2,
                              p: 1, backgroundColor: "#fff",
                            }}
                          />
                        </Box>
                      )}

                      {/* Caterer UPI ID */}
                      {(order.caterer_phonepe_id || order.caterer_upi_id) && (
                        <Box sx={{ mb: 1.5, p: 1.25, borderRadius: 1.5, backgroundColor: "#F5F3FF", border: "1px solid #D8D0F7" }}>
                          <Typography variant="caption" sx={{ color: "#5A4EE8", fontWeight: 700, display: "block", mb: 0.25 }}>
                            Caterer UPI ID
                          </Typography>
                          <Typography sx={{ fontFamily: "monospace", fontWeight: 800, fontSize: "0.95rem", color: "#3D2EA0" }}>
                            {order.caterer_phonepe_id || order.caterer_upi_id}
                          </Typography>
                          {order.caterer_payment_name && (
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {order.caterer_payment_name}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {!order.caterer_qr_url && !order.caterer_phonepe_id && !order.caterer_upi_id && (
                        <Alert severity="warning" sx={{ mb: 1.5, fontSize: "0.8rem" }}>
                          The caterer hasn't set up a QR code or UPI. Collect cash directly.
                        </Alert>
                      )}

                      <Button
                        fullWidth variant="contained"
                        onClick={() => setCodDialog(true)}
                        startIcon={<CheckCircleRoundedIcon />}
                        sx={{
                          fontWeight: 700, py: 1.25, textTransform: "none",
                          backgroundColor: "#2E7D32",
                          "&:hover": { backgroundColor: "#1B5E20" },
                        }}
                      >
                        Payment Received
                      </Button>
                    </>
                  )}

                  {codPaymentPaid && (
                    <Typography variant="body2" sx={{ color: "#2E7D32", fontWeight: 600 }}>
                      Cash of ₹{Number(order.subtotal || 0).toFixed(2)} has been confirmed. You can now complete the delivery.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Pick up step ── */}
            {order.status === "ASSIGNED_TO_RIDER" && (
              <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Ready to pick up?
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Pick up the order from the caterer and tap Start Delivery — navigation will open automatically.
                </Typography>
                <Button
                  fullWidth variant="contained"
                  onClick={handleStart}
                  disabled={startingDelivery}
                  startIcon={startingDelivery ? <CircularProgress size={14} color="inherit" /> : <TwoWheelerRoundedIcon />}
                  sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700, py: 1.25 }}
                >
                  {startingDelivery ? "Starting…" : "Start Delivery"}
                </Button>
              </Card>
            )}

            {/* ── Confirm delivery (code entry) ── */}
            {order.status === "OUT_FOR_DELIVERY" && (
              <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Enter Confirmation Code
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Ask the customer for their 6-digit delivery code to complete the delivery.
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="6-Digit Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  slotProps={{ htmlInput: { maxLength: 6, style: { letterSpacing: "0.4em", fontSize: "1.4rem", fontWeight: 700, textAlign: "center" } } }}
                  sx={{ mb: 2 }}
                />
                {codPaymentPending && (
                  <Alert severity="warning" sx={{ mb: 2, fontSize: "0.8rem" }}>
                    Confirm cash payment collection above before marking as delivered.
                  </Alert>
                )}
                <Button
                  fullWidth variant="contained"
                  onClick={handleConfirmDelivery}
                  disabled={submitting || code.length !== 6 || codPaymentPending}
                  startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CheckCircleRoundedIcon />}
                  sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700, py: 1.25 }}
                >
                  Confirm Delivery
                </Button>
              </Card>
            )}
          </>
        ) : null}
      </Container>

      {/* COD Payment Confirmation Dialog */}
      <Dialog open={codDialog} onClose={() => !confirmingCod && setCodDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Payment Received?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Have you verified that the customer has paid{" "}
            <strong>₹{Number(order?.subtotal || 0).toFixed(2)}</strong> to the caterer's QR / UPI?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCodDialog(false)} disabled={confirmingCod}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmCod}
            disabled={confirmingCod}
            startIcon={confirmingCod ? <CircularProgress size={14} color="inherit" /> : <CheckCircleRoundedIcon />}
            sx={{ backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#1B5E20" }, fontWeight: 700 }}
          >
            Yes, Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
