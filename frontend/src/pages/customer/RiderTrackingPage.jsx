import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader } from "@googlemaps/js-api-loader";
import {
  Box, Card, CardContent, Typography, Chip, IconButton,
  CircularProgress, Alert, Divider, Stack, Button,
} from "@mui/material";
import ArrowBackRoundedIcon      from "@mui/icons-material/ArrowBackRounded";
import TwoWheelerRoundedIcon     from "@mui/icons-material/TwoWheelerRounded";
import AccessTimeRoundedIcon     from "@mui/icons-material/AccessTimeRounded";
import RouteRoundedIcon          from "@mui/icons-material/RouteRounded";
import PhoneRoundedIcon          from "@mui/icons-material/PhoneRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import StorefrontRoundedIcon     from "@mui/icons-material/StorefrontRounded";
import GpsOffRoundedIcon         from "@mui/icons-material/GpsOffRounded";
import MapRoundedIcon            from "@mui/icons-material/MapRounded";
import riderService from "../../services/riderService";

// ── Singleton loader — prevents double-loading if component remounts ──────────
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const mapsLoader = new Loader({
  apiKey: API_KEY,
  version: "weekly",
  libraries: ["maps", "routes", "geometry", "marker"],
});

// ── SVG marker builder ────────────────────────────────────────────────────────
function buildMarkerSvg(bg, iconPath, size = 44) {
  const r = size / 2;
  const iconOffset = (size - 22) / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}">` +
    `<circle cx="${r}" cy="${r}" r="${r - 1}" fill="${bg}" stroke="white" stroke-width="2.5"/>` +
    `<g transform="translate(${iconOffset},${iconOffset})">${iconPath}</g>` +
    `<polygon points="${r - 5},${size - 1} ${r + 5},${size - 1} ${r},${size + 7}" fill="${bg}"/>` +
    `</svg>`
  );
}

const SCOOTER_SVG = buildMarkerSvg(
  "#1565C0",
  `<path fill="white" d="M19 7c0-1.1-.9-2-2-2h-3l-2-4H7L5 5H3C1.9 5 1 5.9 1 7v10c0 1.1.9 2 2 2h.17C3.59 20.23 4.69 21 6 21s2.41-.77 2.83-2h6.34c.42 1.23 1.52 2 2.83 2s2.41-.77 2.83-2H21c.55 0 1-.45 1-1v-6l-3-7zm-7.5 1.5h-3L10 6h1.5v2.5zM6 19.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm12 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zM17 13H3V7h14v6z"/>`
);

const HOME_SVG = buildMarkerSvg(
  "#2E7D32",
  `<path fill="white" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>`
);

const SCOOTER_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(SCOOTER_SVG)}`;
const HOME_URL    = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(HOME_SVG)}`;

// ── Smooth marker animation (AdvancedMarkerElement) ───────────────────────────
function animateMarkerTo(marker, from, to, google, duration = 1200) {
  const start = Date.now();
  let frameId;
  function step() {
    const t    = Math.min((Date.now() - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
    marker.position = new google.maps.LatLng(
      from.lat + (to.lat - from.lat) * ease,
      from.lng + (to.lng - from.lng) * ease
    );
    if (t < 1) frameId = requestAnimationFrame(step);
  }
  frameId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frameId);
}

// ── Status label config ───────────────────────────────────────────────────────
const STATUS_CFG = {
  ASSIGNED_TO_RIDER: { label: "Rider Assigned",   chipBg: "rgba(255,255,255,0.22)" },
  OUT_FOR_DELIVERY:  { label: "Out for Delivery",  chipBg: "rgba(255,255,255,0.22)" },
  DELIVERED:         { label: "Delivered",         chipBg: "rgba(255,255,255,0.22)" },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function RiderTrackingPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  // DOM + map refs (never trigger re-renders)
  const mapDivRef     = useRef(null);
  const mapObj        = useRef(null);      // google.maps.Map
  const riderMarker   = useRef(null);      // AdvancedMarkerElement for rider
  const custMarker    = useRef(null);      // AdvancedMarkerElement for customer
  const dirRenderer   = useRef(null);      // DirectionsRenderer
  const cancelAnim    = useRef(null);      // cancel smooth animation
  const prevRiderPos  = useRef(null);      // last known rider position
  const lastRoutePos  = useRef(null);      // position at last route calculation
  const pollInterval  = useRef(null);
  const googleRef     = useRef(null);      // google namespace, available after load

  // UI state
  const [trackData,  setTrackData]  = useState(null);
  const [distance,   setDistance]   = useState(null);
  const [eta,        setEta]        = useState(null);
  const [mapReady,   setMapReady]   = useState(false);
  const [mapError,   setMapError]   = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // ── Route + ETA via Directions API ─────────────────────────────────────────
  const calcRoute = useCallback((origin, destination) => {
    const google = googleRef.current;
    if (!google || !dirRenderer.current) return;

    new google.maps.DirectionsService().route(
      { origin, destination, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status !== "OK") return;
        dirRenderer.current.setDirections(result);
        const leg = result.routes[0]?.legs[0];
        if (leg) {
          setDistance(leg.distance?.text || null);
          setEta(leg.duration?.text || null);
        }
        lastRoutePos.current = { ...origin };
      }
    );
  }, []);

  // ── Poll handler: fetch location + update map objects ─────────────────────
  const fetchAndUpdate = useCallback(async () => {
    const google = googleRef.current;
    try {
      const data = await riderService.getOrderRiderLocation(orderId);
      setTrackData(data);
      setFetchError(null);

      if (data.order_status === "DELIVERED") {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }

      // No map yet or no rider location — nothing to draw
      if (!mapObj.current || !google || !data.location) return;

      const riderPos = {
        lat: parseFloat(data.location.latitude),
        lng: parseFloat(data.location.longitude),
      };

      // Place / animate rider marker
      if (!riderMarker.current) {
        const img = Object.assign(document.createElement("img"), {
          src: SCOOTER_URL,
        });
        img.style.cssText = "width:44px;height:52px;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.4));";

        riderMarker.current = new google.maps.marker.AdvancedMarkerElement({
          position: riderPos,
          map:      mapObj.current,
          content:  img,
          title:    data.rider?.name || "Rider",
        });
        mapObj.current.panTo(riderPos);
        mapObj.current.setZoom(15);
      } else if (prevRiderPos.current) {
        if (cancelAnim.current) cancelAnim.current();
        cancelAnim.current = animateMarkerTo(
          riderMarker.current, prevRiderPos.current, riderPos, google
        );
      } else {
        riderMarker.current.position = new google.maps.LatLng(riderPos.lat, riderPos.lng);
      }
      prevRiderPos.current = riderPos;

      // Place customer marker once (position is static)
      if (data.customer_lat && data.customer_lng && !custMarker.current) {
        const custPos = {
          lat: parseFloat(data.customer_lat),
          lng: parseFloat(data.customer_lng),
        };
        const img = Object.assign(document.createElement("img"), { src: HOME_URL });
        img.style.cssText = "width:44px;height:52px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3));";

        custMarker.current = new google.maps.marker.AdvancedMarkerElement({
          position: custPos,
          map:      mapObj.current,
          content:  img,
          title:    "Delivery Location",
        });

        // Fit both markers in view
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(riderPos);
        bounds.extend(custPos);
        mapObj.current.fitBounds(bounds, { top: 80, right: 24, bottom: 24, left: 24 });
      }

      // Recalculate route only if rider moved > 100 m since last calculation
      if (data.customer_lat && data.customer_lng) {
        const custPos = {
          lat: parseFloat(data.customer_lat),
          lng: parseFloat(data.customer_lng),
        };
        const shouldRecalc = !lastRoutePos.current ||
          google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(riderPos.lat, riderPos.lng),
            new google.maps.LatLng(lastRoutePos.current.lat, lastRoutePos.current.lng)
          ) > 100;

        if (shouldRecalc) calcRoute(riderPos, custPos);
      }
    } catch (err) {
      setFetchError(err.message || "Failed to fetch rider location");
    }
  }, [orderId, calcRoute]);

  // ── Mount: load Google Maps then start polling ────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current) return;
    let destroyed = false;

    (async () => {
      try {
        if (!API_KEY) {
          setMapError("Google Maps API key is not set. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.");
          return;
        }

        // Load the SDK (returns the google namespace)
        const google = await mapsLoader.load();
        if (destroyed) return;
        googleRef.current = google;

        const { Map } = await google.maps.importLibrary("maps");
        if (destroyed) return;

        mapObj.current = new Map(mapDivRef.current, {
          zoom:              14,
          center:            { lat: 20.5937, lng: 78.9629 }, // India center fallback
          mapId:             "DEMO_MAP_ID",                   // required for AdvancedMarkerElement
          mapTypeControl:    false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl:       true,
          gestureHandling:   "greedy",
          clickableIcons:    false,
        });

        // Route renderer on the map
        dirRenderer.current = new google.maps.DirectionsRenderer({
          map:             mapObj.current,
          suppressMarkers: true, // we render custom markers ourselves
          polylineOptions: {
            strokeColor:   "#1565C0",
            strokeWeight:  4,
            strokeOpacity: 0.85,
          },
        });

        setMapReady(true);

        // First fetch, then poll every 10 s
        await fetchAndUpdate();
        if (!destroyed) {
          pollInterval.current = setInterval(fetchAndUpdate, 10_000);
        }
      } catch (err) {
        if (!destroyed) {
          setMapError("Unable to load Google Maps. " + (err.message || "Check your API key and network."));
        }
      }
    })();

    return () => {
      destroyed = true;
      clearInterval(pollInterval.current);
      if (cancelAnim.current) cancelAnim.current();
      if (riderMarker.current) { riderMarker.current.map = null; riderMarker.current = null; }
      if (custMarker.current)  { custMarker.current.map  = null; custMarker.current  = null; }
      if (dirRenderer.current) { dirRenderer.current.setMap(null); dirRenderer.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ── Derived UI values ─────────────────────────────────────────────────────
  const status      = trackData?.order_status;
  const rider       = trackData?.rider;
  const statusCfg   = STATUS_CFG[status] || { label: status || "Loading…", chipBg: "rgba(255,255,255,0.22)" };
  const isDelivered = status === "DELIVERED";
  const isAssigned  = status === "ASSIGNED_TO_RIDER";
  const hasLoc      = !!trackData?.location;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F5F5", pb: 4 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{
        position: "sticky", top: 0, zIndex: 1200,
        background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
        color: "#fff", px: 2, py: 1.5,
        display: "flex", alignItems: "center", gap: 1,
        boxShadow: "0 2px 16px rgba(27,94,32,0.4)",
      }}>
        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => navigate(-1)}>
          <ArrowBackRoundedIcon />
        </IconButton>
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
          sx={{
            backgroundColor: statusCfg.chipBg,
            color: "#fff", fontWeight: 700, fontSize: "0.7rem", flexShrink: 0,
          }}
        />
      </Box>

      {/* ── Delivered banner ─────────────────────────────────────────────────── */}
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

      {/* ── Google Map ──────────────────────────────────────────────────────── */}
      <Box sx={{
        height: isDelivered ? 260 : 390,
        mt: isDelivered ? 1.5 : 0,
        position: "relative",
        backgroundColor: "#E8EAF6",
      }}>
        {/* The map div — always rendered so ref is stable */}
        <Box ref={mapDivRef} sx={{ height: "100%", width: "100%" }} />

        {/* Loading overlay */}
        {!mapReady && !mapError && (
          <Box sx={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 1.5,
            backgroundColor: "rgba(255,255,255,0.88)",
          }}>
            <CircularProgress sx={{ color: "#1B5E20" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Loading Google Maps…
            </Typography>
          </Box>
        )}

        {/* Map load failure */}
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

        {/* Floating "picking up" pill when assigned but no GPS yet */}
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

      {/* ── Info panels ─────────────────────────────────────────────────────── */}
      <Box sx={{ px: 2, mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>

        {/* Non-fatal fetch error */}
        {fetchError && (
          <Alert severity="warning" icon={<GpsOffRoundedIcon />} sx={{ borderRadius: 2 }}>
            {fetchError}
          </Alert>
        )}

        {/* GPS off for OUT_FOR_DELIVERY */}
        {!isAssigned && !isDelivered && !hasLoc && mapReady && !fetchError && (
          <Alert severity="info" icon={<GpsOffRoundedIcon />} sx={{ borderRadius: 2 }}>
            Live tracking unavailable — rider's GPS may be off. Your order is still on its way!
          </Alert>
        )}

        {/* ETA + Distance  */}
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

        {/* Caterer */}
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

        {/* Location freshness */}
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
