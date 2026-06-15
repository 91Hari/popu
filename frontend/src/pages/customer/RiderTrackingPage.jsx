import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Chip, IconButton,
  CircularProgress, Alert, Divider, Stack,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import TwoWheelerRoundedIcon from "@mui/icons-material/TwoWheelerRounded";
import PersonPinCircleRoundedIcon from "@mui/icons-material/PersonPinCircleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import riderService from "../../services/riderService";

// Fix default Leaflet marker icons broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const riderIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  className: "rider-marker-blue",
});

const customerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

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
  const speedKmh = 25;
  return Math.max(1, Math.round((distKm / speedKmh) * 60));
}

function FlyToRider({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, map.getZoom(), { duration: 0.8 });
  }, [position, map]);
  return null;
}

export default function RiderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchLocation = async () => {
    try {
      const res = await riderService.getOrderRiderLocation(orderId);
      setData(res);
      setError(null);
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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F5F5", pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          position: "sticky", top: 0, zIndex: 100,
          backgroundColor: "#FF6B00", color: "#fff",
          px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => navigate(-1)}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          Live Rider Tracking
        </Typography>
        <Chip
          label={data?.order_status?.replace(/_/g, " ") || "Loading…"}
          size="small"
          sx={{ backgroundColor: "rgba(255,255,255,0.25)", color: "#fff", fontWeight: 700 }}
        />
      </Box>

      {/* Map */}
      <Box sx={{ height: 380, position: "relative" }}>
        {!data && !error && (
          <Box sx={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.7)",
          }}>
            <CircularProgress color="warning" />
          </Box>
        )}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {riderPos && (
            <>
              <FlyToRider position={riderPos} />
              <Marker position={riderPos} icon={riderIcon}>
                <Popup>
                  <strong>{data?.rider?.name || "Rider"}</strong>
                  <br />
                  {data?.rider?.vehicle_type} · {data?.rider?.vehicle_number}
                </Popup>
              </Marker>
            </>
          )}
          {customerPos && (
            <Marker position={customerPos} icon={customerIcon}>
              <Popup>Your delivery address</Popup>
            </Marker>
          )}
        </MapContainer>
      </Box>

      {/* Info cards */}
      <Box sx={{ px: 2, mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* ETA / distance */}
        {distKm !== null && (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={700} color="#FF6B00">
                    {distKm < 1
                      ? `${Math.round(distKm * 1000)} m`
                      : `${distKm.toFixed(1)} km`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Distance away</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center">
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
                    <AccessTimeRoundedIcon fontSize="small" color="warning" />
                    <Typography variant="h5" fontWeight={700} color="#FF6B00">
                      {eta} min
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">Est. arrival</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Rider info */}
        {data?.rider && (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44, height: 44, borderRadius: "50%",
                    backgroundColor: "#FFF3E0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <TwoWheelerRoundedIcon sx={{ color: "#FF6B00" }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {data.rider.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.rider.vehicle_type} · {data.rider.vehicle_number}
                  </Typography>
                </Box>
                <PersonPinCircleRoundedIcon sx={{ color: "#FF6B00" }} />
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Location freshness */}
        {data?.location?.updated_at && (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Location updated {new Date(data.location.updated_at).toLocaleTimeString()}
          </Typography>
        )}

        {/* No location yet */}
        {data && !riderPos && (
          <Alert severity="info">
            Rider location not available yet. The map will update automatically once the rider starts moving.
          </Alert>
        )}
      </Box>
    </Box>
  );
}
