import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Paper, Chip, Button,
  CircularProgress, Alert, Stack, Divider,
} from "@mui/material";
import DirectionsWalkRoundedIcon from "@mui/icons-material/DirectionsWalkRounded";
import StorefrontRoundedIcon      from "@mui/icons-material/StorefrontRounded";
import AccessTimeRoundedIcon      from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon     from "@mui/icons-material/CheckCircleRounded";
import DirectionsRoundedIcon      from "@mui/icons-material/DirectionsRounded";
import AppLayout                  from "../../components/AppLayout";
import { brand }                  from "../../theme";
import api                        from "../../services/api";

function CodeChar({ ch }) {
  return (
    <Box sx={{
      width: 48, height: 58, borderRadius: 2,
      border: `2px solid ${brand.orange}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: brand.orangeLight,
    }}>
      <Typography sx={{ fontFamily: "monospace", fontSize: "1.7rem", fontWeight: 900, color: brand.orange, lineHeight: 1 }}>
        {ch}
      </Typography>
    </Box>
  );
}

export default function CustomerPickupPage() {
  const { masterOrderId } = useParams();
  const navigate          = useNavigate();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.request(`/master-orders/${masterOrderId}`)
      .then((data) => {
        const mo = data.order ?? data;
        setOrder(mo);
      })
      .catch(() => setError("Could not load order details."))
      .finally(() => setLoading(false));
  }, [masterOrderId]);

  const pickupOrder = order?.caterer_orders?.find((co) => co.fulfillment_type === "SELF_PICKUP");

  const isCollected = pickupOrder?.status === "COLLECTED";

  const pickupTime = pickupOrder?.pickup_time
    ? new Date(pickupOrder.pickup_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const mapsLink = pickupOrder?.caterer_lat && pickupOrder?.caterer_lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${pickupOrder.caterer_lat},${pickupOrder.caterer_lng}`
    : null;

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </AppLayout>
    );
  }

  if (error || !pickupOrder) {
    return (
      <AppLayout>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Alert severity="error">{error || "Pickup order not found."}</Alert>
          <Button sx={{ mt: 2 }} onClick={() => navigate("/customer/master-orders")}>Back to Orders</Button>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <DirectionsWalkRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Self Pickup</Typography>
        </Box>

        {isCollected ? (
          <Paper elevation={0} sx={{ border: `2px solid #2E7D32`, borderRadius: 3, p: 3, textAlign: "center", mb: 2 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 56, color: "#2E7D32", mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#2E7D32" }}>Order Collected!</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Your order has been collected. Enjoy your meal!
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Pickup code */}
            <Paper elevation={0} sx={{ border: `2px solid ${brand.orange}`, borderRadius: 3, p: 3, mb: 2, textAlign: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "text.secondary" }}>
                Your Pickup Code
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1.5, mb: 1 }}>
                {(pickupOrder.pickup_code || "------").split("").map((ch, i) => (
                  <CodeChar key={i} ch={ch} />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Show this code to the caterer when you arrive
              </Typography>
            </Paper>

            {/* Status */}
            <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5, mb: 2 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <StorefrontRoundedIcon sx={{ color: brand.orange, fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Caterer</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{pickupOrder.caterer_name || "—"}</Typography>
                  </Box>
                  <Chip
                    label={pickupOrder.status}
                    size="small"
                    sx={{ ml: "auto", fontWeight: 700, fontSize: "0.7rem",
                      backgroundColor: pickupOrder.status === "READY" ? "#E8F5E9" : brand.orangeLight,
                      color: pickupOrder.status === "READY" ? "#2E7D32" : brand.orange,
                    }}
                  />
                </Box>

                <Divider />

                {pickupTime && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AccessTimeRoundedIcon sx={{ color: brand.orange, fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>Ready by (estimated)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{pickupTime}</Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Directions */}
            {mapsLink && (
              <Button
                fullWidth variant="outlined" size="large"
                startIcon={<DirectionsRoundedIcon />}
                onClick={() => window.open(mapsLink, "_blank")}
                sx={{ fontWeight: 700, borderRadius: 2, textTransform: "none", mb: 2,
                  borderColor: brand.orange, color: brand.orange,
                  "&:hover": { borderColor: brand.orange, backgroundColor: brand.orangeLight },
                }}
              >
                Get Directions
              </Button>
            )}
          </>
        )}

        <Button fullWidth variant="text" onClick={() => navigate("/customer/master-orders")}
          sx={{ color: "text.secondary", textTransform: "none" }}>
          View All Orders
        </Button>
      </Container>
    </AppLayout>
  );
}
