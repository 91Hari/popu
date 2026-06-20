import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, Typography, CircularProgress, IconButton,
  TextField, InputAdornment, List, ListItem, ListItemButton,
  ListItemText, useMediaQuery, useTheme, Paper,
} from "@mui/material";
import CloseRoundedIcon      from "@mui/icons-material/CloseRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import MapRoundedIcon        from "@mui/icons-material/MapRounded";
import SearchRoundedIcon     from "@mui/icons-material/SearchRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import CheckRoundedIcon      from "@mui/icons-material/CheckRounded";
import { brand }             from "../theme";
import { Geolocation }       from "@capacitor/geolocation";

// Nominatim reverse-geocode (no API key, no referrer restriction)
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return null;
  return res.json();
}

// Nominatim forward search
async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6&countrycodes=in`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return [];
  return res.json();
}

function parseNominatim(data) {
  const a = data?.address || {};
  const road = a.road || a.pedestrian || a.footway || a.street || a.suburb || "";
  const area = a.suburb || a.neighbourhood || a.quarter || a.village || "";
  const address = [road, area].filter(Boolean).join(", ");
  const city    = a.city || a.town || a.village || a.county || "";
  const state   = a.state || "";
  const pincode = a.postcode || "";
  return { address, city, state, pincode };
}

/**
 * Full-screen location picker using Leaflet + OpenStreetMap.
 *
 * Props:
 *   open, onClose, onConfirm, initialLat, initialLng
 */
export default function MapLocationPicker({ open, onClose, onConfirm, initialLat, initialLng }) {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mapDivRef  = useRef(null);
  const mapRef     = useRef(null);
  const markerRef  = useRef(null);
  const debounce   = useRef(null);

  const [status,   setStatus]   = useState("idle"); // idle|loading|ready|error
  const [preview,  setPreview]  = useState(null);   // {address,city,state,pincode,lat,lng}
  const [geocoding, setGeocoding] = useState(false);
  const [search,   setSearch]   = useState("");
  const [results,  setResults]  = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const doReverseGeocode = useCallback(async (lat, lng) => {
    setGeocoding(true);
    try {
      const data = await reverseGeocode(lat, lng);
      if (data) {
        const parsed = parseNominatim(data);
        setPreview({ ...parsed, lat, lng });
      } else {
        setPreview({ address: "", city: "", state: "", pincode: "", lat, lng });
      }
    } catch {
      setPreview({ address: "", city: "", state: "", pincode: "", lat, lng });
    } finally {
      setGeocoding(false);
    }
  }, []);

  // Load Leaflet lazily and init map
  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setPreview(null);
      setSearch("");
      setResults([]);
      return;
    }

    setStatus("loading");
    let cancelled = false;

    (async () => {
      try {
        const L = (await import("leaflet")).default;

        // Fix Leaflet default icon paths broken by bundlers
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (cancelled || !mapDivRef.current) { setStatus("error"); return; }

        const defaultLat = typeof initialLat === "number" ? initialLat : 17.385;
        const defaultLng = typeof initialLng === "number" ? initialLng : 78.4867;

        // Destroy previous instance if any
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          markerRef.current = null;
        }

        const map = L.map(mapDivRef.current, {
          center:           [defaultLat, defaultLng],
          zoom:             typeof initialLat === "number" ? 15 : 12,
          zoomControl:      true,
          attributionControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        // Custom pin icon (orange)
        const pinIcon = L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34" width="32" height="46">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 22 12 22S24 21 24 12C24 5.37 18.63 0 12 0z" fill="${brand.orange}" stroke="white" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
          </svg>`,
          className: "",
          iconSize:   [32, 46],
          iconAnchor: [16, 46],
        });

        const marker = L.marker([defaultLat, defaultLng], { icon: pinIcon, draggable: true }).addTo(map);
        mapRef.current    = map;
        markerRef.current = marker;

        if (!cancelled) setStatus("ready");

        // Reverse geocode on initial load
        doReverseGeocode(defaultLat, defaultLng);

        // Update on map drag (center-pin style) or marker drag
        map.on("moveend", () => {
          if (cancelled) return;
          const c = map.getCenter();
          marker.setLatLng(c);
          doReverseGeocode(c.lat, c.lng);
        });

        marker.on("dragend", () => {
          if (cancelled) return;
          const ll = marker.getLatLng();
          map.setView(ll, map.getZoom(), { animate: false });
          doReverseGeocode(ll.lat, ll.lng);
        });

      } catch (err) {
        console.error("[MapLocationPicker]", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current  = null;
        markerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // GPS: use Capacitor native geolocation
  const handleMyLocation = useCallback(async () => {
    setGpsLoading(true);
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== "granted") { setGpsLoading(false); return; }
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const { latitude: lat, longitude: lng } = pos.coords;
      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([lat, lng], 16);
        markerRef.current.setLatLng([lat, lng]);
      }
      await doReverseGeocode(lat, lng);
    } catch (err) {
      console.warn("[GPS]", err);
    } finally {
      setGpsLoading(false);
    }
  }, [doReverseGeocode]);

  // Address search via Nominatim
  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounce.current);
    if (val.length < 3) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await nominatimSearch(val);
        setResults(data);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
  }, []);

  const handleSelectResult = useCallback((item) => {
    const lat = parseFloat(item.lat);
    const lng  = parseFloat(item.lon);
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
    setSearch(item.display_name || "");
    setResults([]);
    doReverseGeocode(lat, lng);
  }, [doReverseGeocode]);

  const handleConfirm = () => {
    if (!preview) return;
    onConfirm(preview);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          p: 2, display: "flex", alignItems: "center", gap: 1,
          borderBottom: `1px solid ${brand.border}`,
        }}
      >
        <MapRoundedIcon sx={{ color: brand.orange, fontSize: 22 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
          Pick Location on Map
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          height: { xs: "calc(100vh - 160px)", sm: "520px" },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Map canvas */}
        <Box ref={mapDivRef} sx={{ flex: 1, width: "100%" }} />

        {/* Floating search bar */}
        {status === "ready" && (
          <Box sx={{ position: "absolute", top: 10, left: 10, right: 10, zIndex: 1000 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search for a location…"
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: searching ? (
                  <InputAdornment position="end">
                    <CircularProgress size={14} />
                  </InputAdornment>
                ) : null,
                sx: {
                  backgroundColor: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                  "& fieldset": { border: "none" },
                },
              }}
            />
            {results.length > 0 && (
              <Paper elevation={4} sx={{ mt: 0.5, maxHeight: 200, overflow: "auto", borderRadius: 2 }}>
                <List dense disablePadding>
                  {results.map((r) => (
                    <ListItem disablePadding key={r.place_id}>
                      <ListItemButton onClick={() => handleSelectResult(r)} sx={{ py: 0.75 }}>
                        <LocationOnRoundedIcon sx={{ mr: 1, fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                        <ListItemText
                          primary={r.display_name?.split(",")[0]}
                          secondary={r.display_name?.split(",").slice(1, 3).join(",")}
                          primaryTypographyProps={{ variant: "body2", fontWeight: 600, noWrap: true }}
                          secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        )}

        {/* GPS button */}
        {status === "ready" && (
          <Box sx={{ position: "absolute", bottom: 86, right: 12, zIndex: 1000 }}>
            <IconButton
              onClick={handleMyLocation}
              disabled={gpsLoading}
              size="small"
              sx={{
                backgroundColor: "white",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              {gpsLoading
                ? <CircularProgress size={18} sx={{ color: brand.orange }} />
                : <MyLocationRoundedIcon sx={{ color: brand.orange, fontSize: 20 }} />
              }
            </IconButton>
          </Box>
        )}

        {/* Loading overlay */}
        {status === "loading" && (
          <Box
            sx={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: brand.bg,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress sx={{ color: brand.orange, mb: 1.5 }} size={36} />
              <Typography variant="body2" color="text.secondary">Loading map…</Typography>
            </Box>
          </Box>
        )}

        {/* Error overlay */}
        {status === "error" && (
          <Box
            sx={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 1.5,
              backgroundColor: brand.bg, p: 3, textAlign: "center",
            }}
          >
            <MapRoundedIcon sx={{ fontSize: 52, color: "text.disabled" }} />
            <Typography variant="body1" fontWeight={700}>Map unavailable</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260 }}>
              Could not load the map. Close this dialog and use the{" "}
              <strong>manual address fields</strong> below.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              sx={{ mt: 1, borderColor: brand.orange, color: brand.orange, textTransform: "none", fontWeight: 600 }}
            >
              Close &amp; enter manually
            </Button>
          </Box>
        )}

        {/* Address preview strip */}
        {status === "ready" && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              backgroundColor: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(6px)",
              borderTop: `1px solid ${brand.border}`,
              p: 1.5, px: 2,
              minHeight: 68,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              zIndex: 1000,
            }}
          >
            <LocationOnRoundedIcon sx={{ color: brand.gold, flexShrink: 0, fontSize: 22 }} />
            {geocoding ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={14} sx={{ color: brand.orange }} />
                <Typography variant="body2" color="text.secondary">Detecting address…</Typography>
              </Box>
            ) : preview ? (
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.4, color: brand.dark }}>
                  {preview.address || "Location selected"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {[preview.city, preview.state, preview.pincode].filter(Boolean).join(", ")}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Drag or tap the map to select your location
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ fontWeight: 600, textTransform: "none", borderColor: brand.border, color: "text.secondary" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!preview || geocoding || status !== "ready"}
          startIcon={<CheckRoundedIcon />}
          sx={{
            flex: 1, fontWeight: 700, textTransform: "none",
            background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
            "&:hover": { background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)` },
            "&.Mui-disabled": { background: "#E0E0E0", color: "#9E9E9E" },
          }}
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}
