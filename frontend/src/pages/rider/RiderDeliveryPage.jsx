import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Button,
  CircularProgress, Alert, TextField, Divider, Chip,
} from "@mui/material";
import CheckCircleRoundedIcon  from "@mui/icons-material/CheckCircleRounded";
import TwoWheelerRoundedIcon   from "@mui/icons-material/TwoWheelerRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import PersonRoundedIcon       from "@mui/icons-material/PersonRounded";
import AppLayout from "../../components/AppLayout";
import BackButton from "../../components/BackButton";
import { brand } from "../../theme";
import riderService from "../../services/riderService";

export default function RiderDeliveryPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [code, setCode]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startingDelivery, setStartingDelivery] = useState(false);
  const [done, setDone]           = useState(false);

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

  const handleStart = async () => {
    setStartingDelivery(true);
    try {
      await riderService.startDelivery(id);
      await loadOrder();
    } catch (err) {
      setError(err?.message || "Failed to start delivery.");
    } finally {
      setStartingDelivery(false);
    }
  };

  const handleConfirm = async () => {
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
        <BackButton sx={{ mb: 2 }} />
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
            <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, mb: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                      Order #{order.id?.slice(0, 8).toUpperCase()}
                    </Typography>
                    <Chip
                      label={order.status?.replace(/_/g, " ")}
                      size="small"
                      color={order.status === "OUT_FOR_DELIVERY" ? "warning" : "info"}
                      sx={{ fontWeight: 700, mt: 0.5 }}
                    />
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

            {order.status === "ASSIGNED_TO_RIDER" && (
              <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Ready to pick up?
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Pick up the order from the caterer and tap Start when you leave for delivery.
                </Typography>
                <Button
                  fullWidth variant="contained"
                  onClick={handleStart}
                  disabled={startingDelivery}
                  startIcon={startingDelivery ? <CircularProgress size={14} color="inherit" /> : <TwoWheelerRoundedIcon />}
                  sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700, py: 1.25 }}
                >
                  Start Delivery
                </Button>
              </Card>
            )}

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
                  inputProps={{ maxLength: 6, style: { letterSpacing: "0.4em", fontSize: "1.4rem", fontWeight: 700, textAlign: "center" } }}
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth variant="contained"
                  onClick={handleConfirm}
                  disabled={submitting || code.length !== 6}
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
    </AppLayout>
  );
}
