import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Chip, IconButton,
  CircularProgress, Alert, Divider, Stack, Button,
} from "@mui/material";
import TwoWheelerRoundedIcon     from "@mui/icons-material/TwoWheelerRounded";
import AccessTimeRoundedIcon     from "@mui/icons-material/AccessTimeRounded";
import RouteRoundedIcon          from "@mui/icons-material/RouteRounded";
import PhoneRoundedIcon          from "@mui/icons-material/PhoneRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import StorefrontRoundedIcon     from "@mui/icons-material/StorefrontRounded";
import GpsOffRoundedIcon         from "@mui/icons-material/GpsOffRounded";
import MapRoundedIcon            from "@mui/icons-material/MapRounded";
import riderService from "../../services/riderService";

const STATUS_CFG = {
  ASSIGNED_TO_RIDER: { label: "Rider Assigned",   chipBg: "rgba(255,255,255,0.22)" },
  OUT_FOR_DELIVERY:  { label: "Out for Delivery",  chipBg: "rgba(255,255,255,0.22)" },
  DELIVERED:         { label: "Delivered",         chipBg: "rgba(255,255,255,0.22)" },
};

// Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RiderTrackingPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const mapDivRef    = useRef(null);
  const mapRef       = useRef(null);   // Leaflet map
  const riderMarker  = useRef(null);
  const custMarker   = useRef(null);
  const pollInterval = useRef(null);

  const [trackData,  setTrackData]  = useState(null);
  const [distance,   setDistance]   = useState(null);
  const [eta,        setEta]        = useState(null);
  const [mapReady,   setMapReady]   = useState(false);
  const [mapError,   setMapError]   = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // ── Poll handler ─────────────────────────────────────────────────────────
  const fetchAndUpdate = useCallback(async () => {
    try {
      const data = await riderService.getOrderRiderLocation(orderId);
      setTrackData(data);
      setFetchError(null);

      if (data.order_status === "DELIVERED") {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }

      if (!mapRef.current || !data.location) return;

      const riderPos = [
        parseFloat(data.location.latitude),
        parseFloat(data.location.longitude),
      ];

      // Rider marker
      if (!riderMarker.current) {
        const L = (await import("leaflet")).default;
        const riderIcon = L.divIcon({
          html: `<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#1565C0,#1976D2);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
              <path d="M19 7c0-1.1-.9-2-2-2h-3l-2-4H7L5 5H3C1.9 5 1 5.9 1 7v10c0 1.1.9 2 2 2h.17C3.59 20.23 4.69 21 6 21s2.41-.77 2.83-2h6.34c.42 1.23 1.52 2 2.83 2s2.41-.77 2.83-2H21c.55 0 1-.45 1-1v-6l-3-7zm-7.5 1.5h-3L10 6h1.5v2.5zM6 19.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm12 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zM17 13H3V7h14v6z"/>
            </svg>
          </div>`,
          className: "",
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });
        riderMarker.current = L.marker(riderPos, { icon: riderIcon }).addTo(mapRef.current);
        mapRef.current.setView(riderPos, 15);
      } else {
        riderMarker.current.setLatLng(riderPos);
      }

      // Customer marker
      if (data.customer_lat && data.customer_lng && !custMarker.current) {
        const L = (await import("leaflet")).default;
        const custPos = [parseFloat(data.customer_lat), parseFloat(data.customer_lng)];
        const homeIcon = L.divIcon({
          html: `<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#1B5E20,#2E7D32);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>`,
          className: "",
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });
        custMarker.current = L.marker(custPos, { icon: homeIcon }).addTo(mapRef.current);

        // Fit both in view
        const bounds = L.latLngBounds([riderPos, custPos]);
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }

      // Update distance / ETA from haversine
      if (data.customer_lat && data.customer_lng) {
        const custPos = [parseFloat(data.customer_lat), parseFloat(data.customer_lng)];
        const km = haversineKm(riderPos[0], riderPos[1], custPos[0], custPos[1]);
        setDistance(km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
        const etaMin = Math.max(5, Math.round((km / 25) * 60)); // assume 25 km/h
        setEta(`~${etaMin} min`);
      }
    } catch (err) {
      setFetchError(err.message || "Failed to fetch rider location");
    }
  }, [orderId]);

  // ── Mount: load Leaflet map ───────────────────────────────────────────────
  useEffect(() => {
    let destroyed = false;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (destroyed || !mapDivRef.current) { setMapError("Map container unavailable"); return; }

        if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

        const map = L.map(mapDivRef.current, {
          center:     [17.385, 78.4867],
          zoom:       12,
          zoomControl: true,
          attributionControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        if (!destroyed) setMapReady(true);

        await fetchAndUpdate();
        if (!destroyed) {
          pollInterval.current = setInterval(fetchAndUpdate, 10_000);
        }
      } catch (err) {
        if (!destroyed) setMapError("Unable to load map: " + (err.message || ""));
      }
    })();

    return () => {
      destroyed = true;
      clearInterval(pollInterval.current);
      if (riderMarker.current) { riderMarker.current.remove(); riderMarker.current = null; }
      if (custMarker.current)  { custMarker.current.remove();  custMarker.current  = null; }
      if (mapRef.current)      { mapRef.current.remove();      mapRef.current      = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const status      = trackData?.order_status;
  const rider       = trackData?.rider;
  const statusCfg   = STATUS_CFG[status] || { label: status || "Loading…", chipBg: "rgba(255,255,255,0.22)" };
  const isDelivered = status === "DELIVERED";
  const isAssigned  = status === "ASSIGNED_TO_RIDER";
  const hasLoc      = !!trackData?.location;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F5F5", pb: 4 }}>

      {/* Header */}
      <Box sx={{
        position: "sticky", top: 0, zIndex: 1200,
        background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
        color: "#fff", px: 2, py: 1.5,
        display: "flex", alignItems: "center", gap: 1,
        boxShadow: "0 2px 16px rgba(27,94,32,0.4)",
      }}>
        <Box flex={1} minWidth={0}>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
            Track Order
          </Typography>
          {trackData && (
            <Typography variant="caption" sx={{ opacity: 0.85 }} noWrap>
              #{orderId.slice(0, 8).toUpperCase()}
              {trackData.caterer_name ? ` · ${trackData.caterer_name}` : ""}
            </Typography>
          )}
        </Box>
        <Chip
          label={statusCfg.label}
          size="small"
          sx={{ backgroundColor: statusCfg.chipBg, color: "#fff", fontWeight: 700, fontSize: "0.7rem", flexShrink: 0 }}
        />
      </Box>

      {/* Delivered banner */}
      {isDelivered && (
        <Box sx={{
          mx: 2, mt: 2, p: 2, borderRadius: 2.5,
          background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
          border: "1px solid #A5D6A7",
          display: "flex", alignItems: "center", gap: 1.5,
        }}>
          <CheckCircleRoundedIcon sx={{ color: "#2E7D32", fontSize: 30 }} />
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

      {/* Map */}
      <Box sx={{
        height: isDelivered ? 260 : 390,
        mt: isDelivered ? 1.5 : 0,
        position: "relative",
        backgroundColor: "#E8EAF6",
      }}>
        <Box ref={mapDivRef} sx={{ height: "100%", width: "100%" }} />

        {/* Loading */}
        {!mapReady && !mapError && (
          <Box sx={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 1.5,
            backgroundColor: "rgba(255,255,255,0.88)",
          }}>
            <CircularProgress sx={{ color: "#1B5E20" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Loading map…
            </Typography>
          </Box>
        )}

        {/* Error */}
        {mapError && (
          <Box sx={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 1.5, p: 3, backgroundColor: "#F5F5F5",
          }}>
            <MapRoundedIcon sx={{ fontSize: 52, color: "#BDBDBD" }} />
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
              {mapError}
            </Typography>
          </Box>
        )}

        {/* Picking up pill */}
        {mapReady && !mapError && isAssigned && !hasLoc && (
          <Box sx={{
            position: "absolute", bottom: 14, left: "50%",
            transform: "translateX(-50%)", zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: 3, px: 2.5, py: 1,
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            display: "flex", alignItems: "center", gap: 1, whiteSpace: "nowrap",
          }}>
            <TwoWheelerRoundedIcon sx={{ color: "#1565C0", fontSize: 20 }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: "#1565C0" }}>
              Rider is picking up · Live map coming soon
            </Typography>
          </Box>
        )}
      </Box>

      {/* Info panels */}
      <Box sx={{ px: 2, mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>

        {fetchError && (
          <Alert severity="warning" icon={<GpsOffRoundedIcon />} sx={{ borderRadius: 2 }}>
            {fetchError}
          </Alert>
        )}

        {!isAssigned && !isDelivered && !hasLoc && mapReady && !fetchError && (
          <Alert severity="info" icon={<GpsOffRoundedIcon />} sx={{ borderRadius: 2 }}>
            Live tracking unavailable — rider's GPS may be off. Your order is still on its way!
          </Alert>
        )}

        {(distance || eta) && !isDelivered && (
          <Card elevation={0} sx={{ border: "1px solid #FFE0B2", borderRadius: 2.5, background: "#FFFBF5" }}>
            <CardContent sx={{ py: 1.75, "&:last-child": { pb: 1.75 } }}>
              <Stack direction="row" justifyContent="space-around" alignItems="center">
                <Box textAlign="center">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
                    <RouteRoundedIcon sx={{ color: "#E65100", fontSize: 20 }} />
                    <Typography variant="h6" fontWeight={900} sx={{ color: "#E65100", lineHeight: 1 }}>
                      {distance || "—"}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Distance away
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
                    <AccessTimeRoundedIcon sx={{ color: "#E65100", fontSize: 20 }} />
                    <Typography variant="h6" fontWeight={900} sx={{ color: "#E65100", lineHeight: 1 }}>
                      {eta || "—"}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    ETA
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {rider && (
          <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: 2.5 }}>
            <CardContent sx={{ py: 1.75, "&:last-child": { pb: 1.75 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{
                  width: 50, height: 50, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #1565C0, #1976D2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <TwoWheelerRoundedIcon sx={{ color: "#fff", fontSize: 24 }} />
                </Box>
                <Box flex={1} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={800} noWrap>
                    {rider.name || "Your Rider"}
                  </Typography>
                  {(rider.vehicle_type || rider.vehicle_number) && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                      {[rider.vehicle_type, rider.vehicle_number].filter(Boolean).join(" · ")}
                    </Typography>
                  )}
                </Box>
                {rider.mobile && (
                  <Button
                    component="a"
                    href={`tel:${rider.mobile}`}
                    variant="outlined"
                    size="small"
                    startIcon={<PhoneRoundedIcon fontSize="small" />}
                    sx={{
                      fontWeight: 700, textTransform: "none", flexShrink: 0,
                      borderColor: "#1565C0", color: "#1565C0", borderRadius: 2,
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

        {trackData?.caterer_name && (
          <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: 2.5 }}>
            <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <StorefrontRoundedIcon sx={{ color: "#F4B400", fontSize: 22 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1 }}>
                    Caterer
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {trackData.caterer_name}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {trackData?.location?.updated_at && !isDelivered && (
          <Typography variant="caption" sx={{ color: "text.disabled", textAlign: "center" }}>
            Last updated{" "}
            {new Date(trackData.location.updated_at).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
            })}
            {" · "}auto-refreshes every 10 s
          </Typography>
        )}
      </Box>
    </Box>
  );
}
