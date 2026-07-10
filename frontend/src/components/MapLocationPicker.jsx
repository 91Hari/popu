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
import { requestLocation }   from "../services/locationService";
import { ensureMapsInit }    from "../utils/mapsLoader";
import { parseAddressComponents } from "../utils/parseAddressComponents";

/**
 * Full-screen location picker using Google Maps.
 * Props: open, onClose, onConfirm, initialLat, initialLng
 */
export default function MapLocationPicker({ open, onClose, onConfirm, initialLat, initialLng }) {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mapDivRef = useRef(null);
  const mapRef    = useRef(null);
  const svcRef    = useRef(null);
  const plcRef    = useRef(null);
  const debounce  = useRef(null);

  const [status,     setStatus]     = useState("idle");
  const [preview,    setPreview]    = useState(null);
  const [geocoding,  setGeocoding]  = useState(false);
  const [search,     setSearch]     = useState("");
  const [results,    setResults]    = useState([]);
  const [searching,  setSearching]  = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const doReverseGeocode = useCallback((lat, lng) => {
    setGeocoding(true);
    new window.google.maps.Geocoder().geocode(
      { location: { lat, lng } },
      (res, s) => {
        if (s === "OK" && res?.[0]) {
          const parsed = parseAddressComponents(res[0].address_components);
          setPreview({ ...parsed, lat, lng });
        } else {
          setPreview({ address: "", city: "", state: "", pincode: "", lat, lng });
        }
        setGeocoding(false);
      }
    );
  }, []);

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
        const ok = await ensureMapsInit("maps", "places", "geocoding");
        if (!ok || cancelled || !mapDivRef.current) { setStatus("error"); return; }

        const defaultLat = typeof initialLat === "number" ? initialLat : 17.385;
        const defaultLng = typeof initialLng === "number" ? initialLng : 78.4867;

        if (mapRef.current) {
          window.google.maps.event.clearInstanceListeners(mapRef.current);
          mapRef.current = null;
        }

        const map = new window.google.maps.Map(mapDivRef.current, {
          center:             { lat: defaultLat, lng: defaultLng },
          zoom:               typeof initialLat === "number" ? 15 : 12,
          disableDefaultUI:   false,
          fullscreenControl:  false,
          streetViewControl:  false,
          mapTypeControl:     false,
          zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
        });

        const { AutocompleteService, PlacesService } = window.google.maps.places;
        svcRef.current = new AutocompleteService();
        const attrDiv  = document.createElement("div");
        plcRef.current = new PlacesService(attrDiv);

        mapRef.current = map;
        if (!cancelled) setStatus("ready");

        doReverseGeocode(defaultLat, defaultLng);

        map.addListener("idle", () => {
          if (cancelled) return;
          const c = map.getCenter();
          doReverseGeocode(c.lat(), c.lng());
        });
      } catch (err) {
        console.error("[MapLocationPicker]", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        window.google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleMyLocation = useCallback(async () => {
    setGpsLoading(true);
    try {
      const { latitude: lat, longitude: lng } = await requestLocation();
      if (mapRef.current) {
        mapRef.current.setCenter({ lat, lng });
        mapRef.current.setZoom(16);
      }
    } catch (err) {
      console.warn("[GPS]", err);
    } finally {
      setGpsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounce.current);
    if (val.length < 3) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      if (!svcRef.current) return;
      setSearching(true);
      try {
        const res = await svcRef.current.getPlacePredictions({
          input: val,
          componentRestrictions: { country: "in" },
        });
        setResults(res?.predictions || []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
  }, []);

  const handleSelectResult = useCallback((item) => {
    if (!plcRef.current) return;
    plcRef.current.getDetails(
      { placeId: item.place_id, fields: ["geometry"] },
      (place, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        if (mapRef.current) {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(16);
        }
        setSearch(item.description || "");
        setResults([]);
      }
    );
  }, []);

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
      slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3, overflow: "hidden" } } }}
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

        {/* Fixed center pin */}
        {status === "ready" && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              zIndex: 500,
              // Offset upward for the address strip (~68px) so the pin points at the true center
              marginTop: "-34px",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34" width="36" height="52">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 9 12 22 12 22S24 21 24 12C24 5.37 18.63 0 12 0z"
                fill={brand.orange}
                stroke="white"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="5" fill="white" />
            </svg>
          </Box>
        )}

        {/* Floating search bar */}
        {status === "ready" && (
          <Box sx={{ position: "absolute", top: 10, left: 10, right: 10, zIndex: 1000 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search for a location…"
              value={search}
              onChange={handleSearch}
              slotProps={{
                input: {
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
                          primary={r.structured_formatting?.main_text || r.description?.split(",")[0]}
                          secondary={r.structured_formatting?.secondary_text}
                          slotProps={{
                            primary: { variant: "body2", fontWeight: 600, noWrap: true },
                            secondary: { variant: "caption", noWrap: true },
                          }}
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
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
              Unable to load Google Maps. This may be due to no internet connection or location permission being denied.
              Please use the <strong>manual address fields</strong> below.
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
                Drag the map to set your location
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
