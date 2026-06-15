import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Chip, IconButton,
  CircularProgress, Alert, Divider, Stack, Button,
} from "@mui/material";
import ArrowBackRoundedIcon        from "@mui/icons-material/ArrowBackRounded";
import TwoWheelerRoundedIcon       from "@mui/icons-material/TwoWheelerRounded";
import AccessTimeRoundedIcon       from "@mui/icons-material/AccessTimeRounded";
import PhoneRoundedIcon            from "@mui/icons-material/PhoneRounded";
import CheckCircleRoundedIcon      from "@mui/icons-material/CheckCircleRounded";
import StorefrontRoundedIcon       from "@mui/icons-material/StorefrontRounded";
import GpsOffRoundedIcon           from "@mui/icons-material/GpsOffRounded";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import riderService from "../../services/riderService";

// ── Custom map icons ──────────────────────────────────────────────────────────

const scooterIcon = new L.DivIcon({
  html: `<div style="
    background:#1565C0;border-radius:50%;width:40px;height:40px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 3px 10px rgba(0,0,0,0.35);border:2.5px solid #fff;
    animation:pulse-blue 2s ease-in-out infinite;
  "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="22" height="22">
    <path d="M19 7c0-1.1-.9-2-2-2h-3l-2-4H7L5 5H3C1.9 5 1 5.9 1 7v10c0 1.1.9 2 2 2h.17C3.59 20.23 4.69 21 6 21s2.41-.77 2.83-2h6.34c.42 1.23 1.52 2 2.83 2s2.41-.77 2.83-2H21c.55 0 1-.45 1-1v-6l-3-7zm-7.5 1.5h-3L10 6h1.5v2.5zM6 19.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm12 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zM17 13H3V7h14v6z"/>
  </svg></div>
  <style>@keyframes pulse-blue{0%,100%{box-shadow:0 0 0 0 rgba(21,101,192,0.5)}50%{box-shadow:0 0 0 8px rgba(21,101,192,0)}}</style>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -44],
});

const homeIcon = new L.DivIcon({
  html: `<div style="
    background:#2E7D32;border-radius:50%;width:40px;height:40px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 3px 10px rgba(0,0,0,0.3);border:2.5px solid #fff;
  "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="22" height="22">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg></div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -44],
});

// ── Utilities ─────────────────────────────────────────────────────────────────

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function etaMinutes(distKm) {
  // Bracket-based estimate matching delivery settings
  if (distKm <= 1)  return 5;
  if (distKm <= 3)  return 10;
  if (distKm <= 8)  return 20;
  if (distKm <= 15) return 30;
  return 45;
}

function fmtDist(distKm) {
  return distKm < 1
    ? `${Math.round(distKm * 1000)} m`
    : `${distKm.toFixed(1)} km`;
}

// Smoothly pan map to rider position on each update
function FlyToRider({ position }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (!position) return;
    if (first.current) {
      map.setView(position, 15);
      first.current = false;
    } else {
      map.panTo(position, { animate: true, duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  ASSIGNED_TO_RIDER: { label: "Rider Assigned",   color: "#1565C0", bg: "#E3F2FD" },
  OUT_FOR_DELIVERY:  { label: "Out for Delivery",  color: "#E65100", bg: "#FFF3E0" },
  DELIVERED:         { label: "Delivered",         color: "#2E7D32", bg: "#E8F5E9" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function RiderTrackingPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [data,   setData]   = useState(null);
  const [error,  setError]  = useState(null);
  const intervalRef         = useRef(null);

  const fetchLocation = async () => {
    try {
      const res = await riderService.getOrderRiderLocation(orderId);
      setData(res);
      setError(null);
      // Stop polling once delivered — no more updates needed
      if (res.order_status === "DELIVERED" && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (err) {
      setError(err.message || "Failed to fetch rider location");
    }
  };

  useEffect(() => {
    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, 10_000);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  const riderPos =
    data?.location
      ? [parseFloat(data.location.latitude), parseFloat(data.location.longitude)]
      : null;

  const customerPos =
    data?.customer_lat && data?.customer_lng
      ? [parseFloat(data.customer_lat), parseFloat(data.customer_lng)]
      : null;

  const distKm =
    riderPos && customerPos
      ? haversineKm(riderPos[0], riderPos[1], customerPos[0], customerPos[1])
      : null;

  const eta = distKm !== null ? etaMinutes(distKm) : null;
  const mapCenter = riderPos || customerPos || [20.5937, 78.9629];
  const statusCfg = STATUS_CFG[data?.order_status] || { label: data?.order_status || "…", color: "#555", bg: "#f5f5f5" };
  const isDelivered = data?.order_status === "DELIVERED";
  const isAssigned  = data?.order_status === "ASSIGNED_TO_RIDER";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F5F5", pb: 4 }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "sticky", top: 0, zIndex: 100,
          background: "linear-gradient(135deg, #FF6B00 0%, #FF8C38 100%)",
          color: "#fff", px: 2, py: 1.5,
          display: "flex", alignItems: "center", gap: 1,
          boxShadow: "0 2px 12px rgba(255,107,0,0.3)",
        }}
      >
        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => navigate(-1)}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
            Live Tracking
          </Typography>
          {data && (
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Order #{orderId.slice(0, 8).toUpperCase()}
              {data.caterer_name ? ` · ${data.caterer_name}` : ""}
            </Typography>
          )}
        </Box>
        <Chip
          label={statusCfg.label}
          size="small"
          sx={{
            backgroundColor: "rgba(255,255,255,0.25)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.7rem",
          }}
        />
      </Box>

      {/* ── Delivered banner ────────────────────────────────────────────────── */}
      {isDelivered && (
        <Box
          sx={{
            mx: 2, mt: 2, p: 2, borderRadius: 2,
            background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
            border: "1px solid #A5D6A7",
            display: "flex", alignItems: "center", gap: 1.5,
          }}
        >
          <CheckCircleRoundedIcon sx={{ color: "#2E7D32", fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#1B5E20" }}>
              Order Delivered!
            </Typography>
            <Typography variant="body2" sx={{ color: "#2E7D32" }}>
              Your food has been delivered. Enjoy your meal!
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Map ─────────────────────────────────────────────────────────────── */}
      <Box sx={{ height: isDelivered ? 280 : 360, position: "relative", mt: isDelivered ? 1.5 : 0 }}>
        {!data && !error && (
          <Box sx={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.75)",
          }}>
            <CircularProgress sx={{ color: "#FF6B00" }} />
          </Box>
        )}

        {error && (
          <Box sx={{ position: "absolute", inset: 0, zIndex: 10, p: 2 }}>
            <Alert severity="error" icon={<GpsOffRoundedIcon />}>{error}</Alert>
          </Box>
        )}

        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {riderPos && (
            <>
              <FlyToRider position={riderPos} />
              <Marker position={riderPos} icon={scooterIcon}>
                <Popup>
                  <strong>{data?.rider?.name || "Rider"}</strong>
                  {data?.rider?.vehicle_type && (
                    <><br />{data.rider.vehicle_type}
                    {data.rider.vehicle_number ? ` · ${data.rider.vehicle_number}` : ""}</>
                  )}
                </Popup>
              </Marker>
            </>
          )}

          {customerPos && (
            <Marker position={customerPos} icon={homeIcon}>
              <Popup>Your delivery location</Popup>
            </Marker>
          )}

          {/* Route line — dashed from rider to customer */}
          {riderPos && customerPos && (
            <Polyline
              positions={[riderPos, customerPos]}
              pathOptions={{
                color: "#1565C0",
                weight: 3,
                dashArray: "10, 7",
                opacity: 0.75,
              }}
            />
          )}
        </MapContainer>
      </Box>

      {/* ── Info panels ─────────────────────────────────────────────────────── */}
      <Box sx={{ px: 2, mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>

        {/* ASSIGNED_TO_RIDER — rider picking up, no live location yet */}
        {isAssigned && !riderPos && (
          <Card elevation={0} sx={{ border: "1px solid #BBDEFB", borderRadius: 2.5, background: "#E3F2FD" }}>
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <TwoWheelerRoundedIcon sx={{ color: "#1565C0", fontSize: 26 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#1565C0" }}>
                    Rider is on the way to pick up your order
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#1565C0", opacity: 0.8 }}>
                    Live location will appear once the rider starts delivery
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* ETA / distance card — only when live location available */}
        {distKm !== null && !isDelivered && (
          <Card elevation={0} sx={{ border: "1px solid #FFE0B2", borderRadius: 2.5, background: "#FFF8F0" }}>
            <CardContent sx={{ py: 1.75, "&:last-child": { pb: 1.75 } }}>
              <Stack direction="row" spacing={0} justifyContent="space-around" alignItems="center">
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#E65100", lineHeight: 1.1 }}>
                    {fmtDist(distKm)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Distance away
                  </Typography>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                <Box textAlign="center">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
                    <AccessTimeRoundedIcon sx={{ color: "#E65100", fontSize: 20 }} />
                    <Typography variant="h5" fontWeight={800} sx={{ color: "#E65100", lineHeight: 1.1 }}>
                      {eta} min
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Estimated arrival
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Rider info card */}
        {data?.rider && (
          <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: 2.5 }}>
            <CardContent sx={{ py: 1.75, "&:last-child": { pb: 1.75 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TwoWheelerRoundedIcon sx={{ color: "#fff", fontSize: 24 }} />
                </Box>

                <Box flex={1} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={800} noWrap>
                    {data.rider.name || "Your Rider"}
                  </Typography>
                  {(data.rider.vehicle_type || data.rider.vehicle_number) && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                      {[data.rider.vehicle_type, data.rider.vehicle_number]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                  )}
                </Box>

                {data.rider.mobile && (
                  <Button
                    component="a"
                    href={`tel:${data.rider.mobile}`}
                    variant="outlined"
                    size="small"
                    startIcon={<PhoneRoundedIcon fontSize="small" />}
                    sx={{
                      fontWeight: 700,
                      textTransform: "none",
                      borderColor: "#1565C0",
                      color: "#1565C0",
                      borderRadius: 2,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      "&:hover": { backgroundColor: "#E3F2FD" },
                    }}
                  >
                    Call
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Caterer name */}
        {data?.caterer_name && (
          <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: 2.5 }}>
            <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <StorefrontRoundedIcon sx={{ color: "#FF6B00", fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1 }}>
                    Caterer
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {data.caterer_name}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Location freshness */}
        {data?.location?.updated_at && !isDelivered && (
          <Typography variant="caption" sx={{ color: "text.disabled", textAlign: "center" }}>
            Last updated {new Date(data.location.updated_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
            {" · "}refreshes every 10 seconds
          </Typography>
        )}

        {/* No location yet for OUT_FOR_DELIVERY (GPS not available on rider device) */}
        {data && !riderPos && !isAssigned && !isDelivered && (
          <Alert severity="info" icon={<GpsOffRoundedIcon />}>
            Live tracking unavailable — the rider's GPS may be off. Your order is still on its way.
          </Alert>
        )}
      </Box>
    </Box>
  );
}
