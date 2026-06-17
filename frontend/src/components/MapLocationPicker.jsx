import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, Typography, CircularProgress, IconButton,
  Autocomplete as MuiAutocomplete, TextField,
  useMediaQuery, useTheme,
} from "@mui/material";
import CloseRoundedIcon      from "@mui/icons-material/CloseRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import MapRoundedIcon        from "@mui/icons-material/MapRounded";
import SearchRoundedIcon     from "@mui/icons-material/SearchRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import CheckRoundedIcon      from "@mui/icons-material/CheckRounded";
import { ensureMapsInit }        from "../utils/mapsLoader";
import { parseAddressComponents } from "../utils/parseAddressComponents";
import { brand }                  from "../theme";

/**
 * Full-screen map dialog for picking a location.
 *
 * Props:
 *   open         — boolean
 *   onClose      — () => void
 *   onConfirm    — ({ address, city, state, pincode, lat, lng }) => void
 *   initialLat   — number | null
 *   initialLng   — number | null
 */
export default function MapLocationPicker({ open, onClose, onConfirm, initialLat, initialLng }) {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const mapDivRef   = useRef(null);
  const mapObjRef   = useRef(null);
  const geocoderRef = useRef(null);
  const idleRef     = useRef(null);
  const reqRef      = useRef(0); // stale-request guard for geocoding

  const [status, setStatus]       = useState("idle"); // idle | loading | ready | error
  const [geocoding, setGeocoding] = useState(false);
  const [preview, setPreview]     = useState(null);   // { address, city, state, pincode, lat, lng }

  // Search
  const [searchVal, setSearchVal]   = useState("");
  const [options, setOptions]       = useState([]);
  const [searching, setSearching]   = useState(false);
  const svcRef   = useRef(null); // AutocompleteService
  const plcRef   = useRef(null); // PlacesService
  const attrDiv  = useRef(null); // hidden attribution div
  const debounce = useRef(null);

  // Reverse-geocode the current map center
  const geocodeCenter = useCallback(() => {
    if (!mapObjRef.current || !geocoderRef.current) return;
    const center = mapObjRef.current.getCenter();
    const lat    = center.lat();
    const lng    = center.lng();
    const req    = ++reqRef.current;
    setGeocoding(true);
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, geocStatus) => {
      if (req !== reqRef.current) return; // superseded
      setGeocoding(false);
      if (geocStatus === "OK" && results?.[0]) {
        const parsed = parseAddressComponents(results[0].address_components);
        setPreview({ ...parsed, lat, lng });
      } else {
        setPreview({ address: "", city: "", state: "", pincode: "", lat, lng });
      }
    });
  }, []);

  // Init / cleanup on open toggle
  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setPreview(null);
      setSearchVal("");
      setOptions([]);
      return;
    }

    setStatus("loading");
    let cancelled = false;

    (async () => {
      try {
        const ok = await ensureMapsInit("maps", "places", "geocoding");
        if (!ok || cancelled) { setStatus("error"); return; }
        if (!mapDivRef.current || cancelled) { setStatus("error"); return; }

        const defaultCenter = {
          lat: typeof initialLat === "number" ? initialLat : 17.385,
          lng: typeof initialLng === "number" ? initialLng : 78.4867,
        };

        const map = new window.google.maps.Map(mapDivRef.current, {
          center:            defaultCenter,
          zoom:              typeof initialLat === "number" ? 15 : 12,
          mapTypeControl:    false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl:       true,
          clickableIcons:    false,
          gestureHandling:   "greedy",
        });

        mapObjRef.current   = map;
        geocoderRef.current = new window.google.maps.Geocoder();

        const { AutocompleteService, PlacesService } = window.google.maps.places;
        svcRef.current  = new AutocompleteService();
        attrDiv.current = attrDiv.current || document.createElement("div");
        plcRef.current  = new PlacesService(attrDiv.current);

        idleRef.current = map.addListener("idle", geocodeCenter);
        setStatus("ready");
        geocodeCenter();
      } catch (err) {
        console.error("[MapLocationPicker]", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (idleRef.current) {
        window.google?.maps?.event?.removeListener(idleRef.current);
        idleRef.current = null;
      }
      mapObjRef.current = null;
    };
  }, [open, initialLat, initialLng, geocodeCenter]);

  // GPS "My Location" button
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation || !mapObjRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll = new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        mapObjRef.current.panTo(ll);
        mapObjRef.current.setZoom(16);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Place search
  const fetchPredictions = useCallback(async (text) => {
    if (!svcRef.current || text.length < 3) { setOptions([]); return; }
    setSearching(true);
    try {
      const res = await svcRef.current.getPlacePredictions({
        input: text,
        componentRestrictions: { country: "in" },
      });
      setOptions(res?.predictions || []);
    } catch {
      setOptions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (_, val, reason) => {
    setSearchVal(val);
    if (reason === "input") {
      clearTimeout(debounce.current);
      debounce.current = setTimeout(() => fetchPredictions(val), 350);
    } else if (reason === "clear") {
      setOptions([]);
    }
  };

  const handleSearchSelect = (_, option) => {
    if (!option || typeof option === "string" || !plcRef.current) return;
    setSearchVal(option.description || "");
    setOptions([]);
    plcRef.current.getDetails(
      { placeId: option.place_id, fields: ["geometry"] },
      (place, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place?.geometry) return;
        mapObjRef.current?.panTo(place.geometry.location);
        mapObjRef.current?.setZoom(16);
      }
    );
  };

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
      {/* ── Title ─────────────────────────────────────────────────────────────── */}
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

      {/* ── Map area ──────────────────────────────────────────────────────────── */}
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

        {/* ── Floating search bar ── */}
        {status === "ready" && (
          <Box
            sx={{
              position: "absolute", top: 10, left: 10, right: 10, zIndex: 10,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            }}
          >
            <MuiAutocomplete
              freeSolo
              options={options}
              inputValue={searchVal}
              filterOptions={(x) => x}
              getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.description || "")}
              getOptionKey={(opt) => (typeof opt === "string" ? opt : opt.place_id)}
              loading={searching}
              onInputChange={handleSearchChange}
              onChange={handleSearchSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for a location…"
                  size="small"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary", mr: 0.5 }} />
                      ),
                      endAdornment: (
                        <>
                          {searching && <CircularProgress size={14} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                  sx={{ "& fieldset": { border: "none" } }}
                />
              )}
              renderOption={(props, opt) => (
                <Box component="li" {...props} key={opt.place_id}>
                  <LocationOnRoundedIcon sx={{ mr: 1, fontSize: 17, color: "text.secondary", flexShrink: 0, mt: 0.2 }} />
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {opt.structured_formatting?.main_text || opt.description}
                    </Typography>
                    {opt.structured_formatting?.secondary_text && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {opt.structured_formatting.secondary_text}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            />
          </Box>
        )}

        {/* ── Fixed center pin (Uber-style) ── */}
        {status === "ready" && (
          <Box
            sx={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: 2, left: "50%",
                transform: "translateX(-50%)",
                width: 10, height: 3,
                backgroundColor: "rgba(0,0,0,0.25)",
                borderRadius: "50%",
                filter: "blur(2px)",
              }}
            />
            <LocationOnRoundedIcon
              sx={{
                fontSize: 50,
                color: brand.gold,
                display: "block",
                filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
              }}
            />
          </Box>
        )}

        {/* ── GPS button ── */}
        {status === "ready" && (
          <Box sx={{ position: "absolute", bottom: 86, right: 12, zIndex: 10 }}>
            <IconButton
              onClick={handleMyLocation}
              size="small"
              sx={{
                backgroundColor: "white",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              <MyLocationRoundedIcon sx={{ color: brand.orange, fontSize: 20 }} />
            </IconButton>
          </Box>
        )}

        {/* ── Loading overlay ── */}
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

        {/* ── Error overlay ── */}
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
            <Typography variant="body1" fontWeight={700}>Unable to load map</Typography>
            <Typography variant="body2" color="text.secondary">
              Check your connection and try again.
            </Typography>
          </Box>
        )}

        {/* ── Address preview strip ── */}
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

      {/* ── Actions ───────────────────────────────────────────────────────────── */}
      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            fontWeight: 600, textTransform: "none",
            borderColor: brand.border, color: "text.secondary",
          }}
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
