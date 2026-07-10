import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Chip, IconButton,
  CircularProgress, Alert, Stack, Button,
} from "@mui/material";
import TwoWheelerRoundedIcon     from "@mui/icons-material/TwoWheelerRounded";
import AccessTimeRoundedIcon     from "@mui/icons-material/AccessTimeRounded";
import PhoneRoundedIcon          from "@mui/icons-material/PhoneRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import StorefrontRoundedIcon     from "@mui/icons-material/StorefrontRounded";
import GpsOffRoundedIcon         from "@mui/icons-material/GpsOffRounded";
import MapRoundedIcon            from "@mui/icons-material/MapRounded";
import ArrowBackRoundedIcon      from "@mui/icons-material/ArrowBackRounded";
import riderService from "../../services/riderService";

const ORDER_STATUS_CFG = {
  PENDING:          { label: "Pending",        color: "#9E9E9E" },
  CONFIRMED:        { label: "Confirmed",      color: "#1565C0" },
  PREPARING:        { label: "Preparing",      color: "#E07B0A" },
  READY:            { label: "Ready",          color: "#7B1FA2" },
  ASSIGNED_TO_RIDER:{ label: "Rider Assigned", color: "#0277BD" },
  OUT_FOR_DELIVERY: { label: "On the Way",     color: "#E65100" },
  DELIVERED:        { label: "Delivered",      color: "#2E7D32" },
  CANCELLED:        { label: "Cancelled",      color: "#B71C1C" },
};

export default function RiderTrackingPage() {
  const { orderId } = useParams(); // master_order_id
  const navigate    = useNavigate();

  const mapDivRef    = useRef(null);
  const mapRef       = useRef(null);
  const riderMarker  = useRef(null);
  const pollInterval = useRef(null);

  const [trackingRows, setTrackingRows] = useState([]);
  const [mapReady,     setMapReady]     = useState(false);
  const [mapError,     setMapError]     = useState(null);
  const [fetchError,   setFetchError]   = useState(null);
  const [loading,      setLoading]      = useState(true);

  const firstRow     = trackingRows[0] ?? null;
  const rider        = firstRow?.rider_name ? {
    name:           firstRow.rider_name,
    phone:          firstRow.rider_phone,
    vehicle_type:   firstRow.vehicle_type,
    vehicle_number: firstRow.vehicle_number,
  } : null;
  const riderLat        = firstRow?.rider_lat ? parseFloat(firstRow.rider_lat) : null;
  const riderLng        = firstRow?.rider_lng ? parseFloat(firstRow.rider_lng) : null;
  const batchEta        = firstRow?.batch_eta_minutes;
  const hasRiderLoc     = riderLat !== null && riderLng !== null;
  const allDelivered    = trackingRows.length > 0 && trackingRows.every(r => r.order_status === "DELIVERED");
  const locationUpdated = firstRow?.rider_location_updated_at;

  const fetchAndUpdate = useCallback(async () => {
    try {
      const data = await riderService.getDeliveryTracking(orderId);
      const rows = data?.tracking ?? [];
      setTrackingRows(rows);
      setFetchError(null);

      if (rows.length > 0 && rows.every(r => r.order_status === "DELIVERED")) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }

      const lat = rows[0]?.rider_lat ? parseFloat(rows[0].rider_lat) : null;
      const lng = rows[0]?.rider_lng ? parseFloat(rows[0].rider_lng) : null;

      if (!mapRef.current || lat === null || lng === null) return;

      const pos = { lat, lng };
      if (!riderMarker.current) {
        const riderIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M19 7c0-1.1-.9-2-2-2h-3l-2-4H7L5 5H3C1.9 5 1 5.9 1 7v10c0 1.1.9 2 2 2h.17C3.59 20.23 4.69 21 6 21s2.41-.77 2.83-2h6.34c.42 1.23 1.52 2 2.83 2s2.41-.77 2.83-2H21c.55 0 1-.45 1-1v-6l-3-7zm-7.5 1.5h-3L10 6h1.5v2.5zM6 19.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm12 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zM17 13H3V7h14v6z"/></svg>`;
        const iconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#1565C0" stroke="white" stroke-width="3"/>${riderIconSvg.replace('width="24" height="24"', 'x="12" y="12" width="24" height="24"')}</svg>`
        )}`;
        riderMarker.current = new window.google.maps.Marker({
          position: pos,
          map: mapRef.current,
          icon: {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 24),
          },
        });
        mapRef.current.setCenter(pos);
        mapRef.current.setZoom(15);
      } else {
        riderMarker.current.setPosition(pos);
      }
    } catch (err) {
      setFetchError(err.message || "Failed to fetch tracking data");
    }
  }, [orderId]);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      try {
        const { ensureMapsInit } = await import("../../utils/mapsLoader");
        const ok = await ensureMapsInit("maps");
        if (!ok || destroyed || !mapDivRef.current) { setMapError("Map unavailable"); return; }

        if (mapRef.current) {
          window.google.maps.event.clearInstanceListeners(mapRef.current);
          mapRef.current = null;
        }

        const map = new window.google.maps.Map(mapDivRef.current, {
          center: { lat: 17.385, lng: 78.4867 }, zoom: 12,
          disableDefaultUI: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        });
        mapRef.current = map;
        if (!destroyed) setMapReady(true);

        await fetchAndUpdate();
        setLoading(false);
        if (!destroyed) {
          pollInterval.current = setInterval(fetchAndUpdate, 15_000);
        }
      } catch (err) {
        if (!destroyed) { setMapError("Unable to load map: " + (err.message || "")); setLoading(false); }
      }
    })();

    return () => {
      destroyed = true;
      clearInterval(pollInterval.current);
      if (riderMarker.current) { riderMarker.current.setMap(null); riderMarker.current = null; }
      if (mapRef.current) {
        window.google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F5F5", pb: 4 }}>

      {/* Header */}
      <Box sx={{
        position: "sticky", top: 0, zIndex: 1200,
        background: "linear-gradient(135deg, #E65100 0%, #F57C00 100%)",
        color: "#fff", px: 2, py: 1.5,
        display: "flex", alignItems: "center", gap: 1,
        boxShadow: "0 2px 16px rgba(230,81,0,0.4)",
      }}>
        <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: "#fff", mr: 0.5 }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box flex={1} minWidth={0}>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>Track Order</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }} noWrap>
            #{orderId.slice(0, 8).toUpperCase()}
          </Typography>
        </Box>
        {batchEta && !allDelivered && (
          <Chip
            icon={<AccessTimeRoundedIcon sx={{ fontSize: 14, color: "#fff !important" }} />}
            label={`~${batchEta} min`}
            size="small"
            sx={{ backgroundColor: "rgba(255,255,255,0.22)", color: "#fff", fontWeight: 700, fontSize: "0.7rem" }}
          />
        )}
      </Box>

      {/* Delivered banner */}
      {allDelivered && (
        <Box sx={{
          mx: 2, mt: 2, p: 2, borderRadius: 2.5,
          background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
          border: "1px solid #A5D6A7",
          display: "flex", alignItems: "center", gap: 1.5,
        }}>
          <CheckCircleRoundedIcon sx={{ color: "#2E7D32", fontSize: 30 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#1B5E20" }}>All Orders Delivered!</Typography>
            <Typography variant="body2" sx={{ color: "#2E7D32" }}>Your food has been delivered. Enjoy your meal!</Typography>
          </Box>
        </Box>
      )}

      {/* Map */}
      <Box sx={{ height: allDelivered ? 240 : 340, mt: allDelivered ? 1.5 : 0, position: "relative", backgroundColor: "#E8EAF6" }}>
        <Box ref={mapDivRef} sx={{ height: "100%", width: "100%" }} />

        {(loading || (!mapReady && !mapError)) && (
          <Box sx={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 1.5,
            backgroundColor: "rgba(255,255,255,0.88)",
          }}>
            <CircularProgress sx={{ color: "#E65100" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Loading map…</Typography>
          </Box>
        )}

        {mapError && (
          <Box sx={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 1.5, p: 3, backgroundColor: "#F5F5F5",
          }}>
            <MapRoundedIcon sx={{ fontSize: 52, color: "#BDBDBD" }} />
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>{mapError}</Typography>
          </Box>
        )}

        {mapReady && !mapError && !hasRiderLoc && !allDelivered && (
          <Box sx={{
            position: "absolute", bottom: 14, left: "50%",
            transform: "translateX(-50%)", zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: 3, px: 2.5, py: 1,
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            display: "flex", alignItems: "center", gap: 1, whiteSpace: "nowrap",
          }}>
            <TwoWheelerRoundedIcon sx={{ color: "#E65100", fontSize: 20 }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: "#E65100" }}>
              Rider is on the way · Live map loading
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

        {/* Per-caterer status */}
        {trackingRows.length > 0 && (
          <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: 2.5 }}>
            <CardContent sx={{ py: 1.75, "&:last-child": { pb: 1.75 } }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", display: "block", mb: 1.25, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.65rem" }}>
                Order Status
              </Typography>
              <Stack spacing={1.25}>
                {trackingRows.map((row) => {
                  const sCfg = ORDER_STATUS_CFG[row.order_status] ?? { label: row.order_status, color: "#757575" };
                  return (
                    <Stack key={row.caterer_order_id} direction="row" alignItems="center" spacing={1.25}>
                      <StorefrontRoundedIcon sx={{ color: "#F4B400", fontSize: 18, flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }} noWrap>
                        {row.caterer_business || row.caterer_name}
                      </Typography>
                      <Chip
                        label={sCfg.label}
                        size="small"
                        sx={{ backgroundColor: sCfg.color + "1A", color: sCfg.color, fontWeight: 700, fontSize: "0.65rem", height: 22 }}
                      />
                    </Stack>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Rider card */}
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
                  <Typography variant="subtitle1" fontWeight={800} noWrap>{rider.name}</Typography>
                  {(rider.vehicle_type || rider.vehicle_number) && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                      {[rider.vehicle_type, rider.vehicle_number].filter(Boolean).join(" · ")}
                    </Typography>
                  )}
                </Box>
                {rider.phone && (
                  <Button
                    component="a" href={`tel:${rider.phone}`}
                    variant="outlined" size="small"
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

        {locationUpdated && !allDelivered && (
          <Typography variant="caption" sx={{ color: "text.disabled", textAlign: "center" }}>
            Last updated{" "}
            {new Date(locationUpdated).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
            })}
            {" · "}auto-refreshes every 15 s
          </Typography>
        )}
      </Box>
    </Box>
  );
}
