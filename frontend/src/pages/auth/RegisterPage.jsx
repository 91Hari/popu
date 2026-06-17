import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Alert, CircularProgress, Stack, InputAdornment, IconButton,
  Divider,
} from "@mui/material";
import VisibilityRoundedIcon    from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import PersonRoundedIcon        from "@mui/icons-material/PersonRounded";
import StorefrontRoundedIcon    from "@mui/icons-material/StorefrontRounded";
import MyLocationRoundedIcon    from "@mui/icons-material/MyLocationRounded";
import MapRoundedIcon           from "@mui/icons-material/MapRounded";
import Logo                     from "../../components/Logo";
import PlacesAutocompleteField  from "../../components/PlacesAutocompleteField";
import MapLocationPicker        from "../../components/MapLocationPicker";
import authService              from "../../services/authService";
import { ensureMapsInit }       from "../../utils/mapsLoader";
import { parseAddressComponents } from "../../utils/parseAddressComponents";
import { brand }                from "../../theme";

function validatePassword(pw) {
  if (!pw || pw.length < 8)  return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw))    return "Must contain at least one uppercase letter";
  if (!/[a-z]/.test(pw))    return "Must contain at least one lowercase letter";
  if (!/[0-9]/.test(pw))    return "Must contain at least one number";
  return null;
}

const sectionHeaderSx = {
  fontWeight: 700,
  mb: 1.5,
  color: "text.secondary",
  textTransform: "uppercase",
  fontSize: "0.68rem",
  letterSpacing: 1,
};

const primaryBtnBaseSx = {
  fontWeight: 700, borderRadius: 1.5, textTransform: "none",
  background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
  color: "#fff",
  "&:hover": { background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)` },
};

export default function RegisterPage() {
  // ── Role ────────────────────────────────────────────────────────────────────
  const [role, setRole] = useState("CUSTOMER");

  // ── Personal fields ──────────────────────────────────────────────────────────
  const [name, setName]               = useState("");
  const [mobile, setMobile]           = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [showCpw, setShowCpw]         = useState(false);

  // ── Location fields ──────────────────────────────────────────────────────────
  const [loc, setLoc] = useState({ address: "", city: "", addrState: "", pincode: "", lat: null, lng: null });
  const setLocField = (fields) => setLoc((f) => ({ ...f, ...fields }));
  const [detecting, setDetecting]     = useState(false);
  const [locInfo, setLocInfo]         = useState(null); // { type, message }
  const [mapOpen, setMapOpen]         = useState(false);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  // ── Reverse geocode coordinates → address fields ─────────────────────────────
  const geocodePosition = useCallback(async (latitude, longitude) => {
    try {
      const ok = await ensureMapsInit("geocoding");
      if (!ok) throw new Error("Maps unavailable");
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const parsed = parseAddressComponents(results[0].address_components);
          setLocField({
            address:    parsed.address  || "",
            city:       parsed.city     || "",
            addrState:  parsed.state    || "",
            pincode:    parsed.pincode  || "",
            lat:        latitude,
            lng:        longitude,
          });
          setLocInfo({ type: "success", message: "Location detected — review and edit if needed." });
        } else {
          setLocField({ lat: latitude, lng: longitude });
          setLocInfo({ type: "info", message: "Location coordinates captured. Please fill in the address." });
        }
        setDetecting(false);
      });
    } catch {
      setLocField({ lat: latitude, lng: longitude });
      setLocInfo({ type: "info", message: "Could not auto-fill address. Please enter manually." });
      setDetecting(false);
    }
  }, []);

  // ── GPS detect (called on mount + button click) ──────────────────────────────
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocInfo({ type: "warning", message: "Geolocation is not supported by your browser." });
      return;
    }
    setDetecting(true);
    setLocInfo(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => geocodePosition(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setDetecting(false);
        setLocInfo({
          type: "warning",
          message: err.code === 1
            ? "Unable to detect your location. Please enter address manually."
            : "Could not detect location. Please enter address manually.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [geocodePosition]);

  const handleMapConfirm = ({ address, city, state, pincode, lat, lng }) => {
    setLocField({ address, city, addrState: state, pincode, lat, lng });
    setErrors((e) => ({ ...e, address: "", city: "", state: "", pincode: "" }));
    setLocInfo({ type: "success", message: "Location pinned on map — review and edit if needed." });
  };

  // Auto-detect on mount
  useEffect(() => { handleDetectLocation(); }, [handleDetectLocation]);

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!name.trim())                         e.name     = "Name is required";
    else if (name.trim().length < 2)          e.name     = "Name must be at least 2 characters";
    if (!mobile)                              e.mobile   = "Mobile number is required";
    else if (!/^\d{10}$/.test(mobile))        e.mobile   = "Enter a valid 10-digit mobile number";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                                              e.email    = "Enter a valid email address";
    const pwErr = validatePassword(password);
    if (pwErr)                                e.password = pwErr;
    if (!confirmPw)                           e.confirm  = "Please confirm your password";
    else if (password !== confirmPw)          e.confirm  = "Passwords do not match";
    if (!loc.address.trim())                  e.address  = "Address is required";
    if (!loc.city.trim())                     e.city     = "City is required";
    if (!loc.addrState.trim())                e.state    = "State is required";
    if (!loc.pincode.trim())                  e.pincode  = "Pincode is required";
    else if (!/^\d{6}$/.test(loc.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await authService.register({
        name:         name.trim(),
        mobileNumber: mobile,
        email:        email.trim() || undefined,
        password,
        role,
        address:   loc.address.trim()    || undefined,
        city:      loc.city.trim()       || undefined,
        state:     loc.addrState.trim()  || undefined,
        pincode:   loc.pincode.trim()    || undefined,
        latitude:  loc.lat               ?? undefined,
        longitude: loc.lng               ?? undefined,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clrErr = (key) => () => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 480, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Logo size={52} height={90} width={90} showTagline />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Create Account</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
            {role === "CATERER"
              ? "Join Popu to sell your food to customers"
              : "Join Popu to order food from local caterers"}
          </Typography>

          {/* ── Role selector ─────────────────────────────────────────────── */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
            {[
              { value: "CUSTOMER", label: "Customer", icon: <PersonRoundedIcon /> },
              { value: "CATERER",  label: "Caterer",  icon: <StorefrontRoundedIcon /> },
            ].map(({ value, label, icon }) => (
              <Button
                key={value}
                fullWidth
                variant={role === value ? "contained" : "outlined"}
                startIcon={icon}
                onClick={() => setRole(value)}
                sx={role === value ? primaryBtnBaseSx : {
                  borderColor: brand.border, color: "text.secondary", fontWeight: 600,
                  borderRadius: 1.5, textTransform: "none",
                  "&:hover": { borderColor: brand.orange, color: brand.orange, backgroundColor: brand.greenLight },
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>

          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>

              {/* ── Personal Info ──────────────────────────────────────────── */}
              <Typography variant="subtitle2" sx={sectionHeaderSx}>Personal Info</Typography>

              <TextField
                fullWidth label="Full Name" value={name}
                onChange={(e) => { setName(e.target.value); clrErr("name")(); }}
                disabled={loading} autoComplete="name"
                placeholder="e.g. Priya Sharma" autoFocus
                error={!!errors.name} helperText={errors.name}
              />

              <TextField
                fullWidth label="Mobile Number" value={mobile}
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); clrErr("mobile")(); }}
                disabled={loading} inputMode="numeric" autoComplete="tel-national"
                placeholder="10-digit mobile number"
                slotProps={{ input: { startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.9rem" }}>+91</Typography>
                  </InputAdornment>
                )}}}
                error={!!errors.mobile} helperText={errors.mobile}
              />

              <TextField
                fullWidth label="Email Address (Optional)" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); clrErr("email")(); }}
                disabled={loading} autoComplete="email" placeholder="example@email.com"
                error={!!errors.email} helperText={errors.email || "Used to receive order confirmations"}
              />

              <TextField
                fullWidth label="Password" type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clrErr("password")(); }}
                disabled={loading} autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password || "Min 8 chars, uppercase, lowercase, number"}
                slotProps={{ input: { endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw((v) => !v)} edge="end" size="small" tabIndex={-1}>
                      {showPw ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )}}}
              />

              <TextField
                fullWidth label="Confirm Password" type={showCpw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); clrErr("confirm")(); }}
                disabled={loading} autoComplete="new-password"
                error={!!errors.confirm} helperText={errors.confirm}
                slotProps={{ input: { endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCpw((v) => !v)} edge="end" size="small" tabIndex={-1}>
                      {showCpw ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )}}}
              />

              {/* ── Location Details ───────────────────────────────────────── */}
              <Divider sx={{ my: 0.5 }} />
              <Typography variant="subtitle2" sx={sectionHeaderSx}>Location Details</Typography>

              {locInfo && (
                <Alert severity={locInfo.type} sx={{ py: 0.5 }}>{locInfo.message}</Alert>
              )}

              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth variant="outlined"
                  startIcon={detecting
                    ? <CircularProgress size={15} sx={{ color: brand.orange }} />
                    : <MyLocationRoundedIcon fontSize="small" />}
                  onClick={handleDetectLocation}
                  disabled={detecting || loading}
                  sx={{
                    borderColor: brand.orange, color: brand.orange, fontWeight: 700,
                    textTransform: "none", borderRadius: 1.5, fontSize: "0.82rem",
                    "&:hover": { borderColor: brand.orange, backgroundColor: brand.greenLight },
                  }}
                >
                  {detecting ? "Detecting…" : "Use GPS"}
                </Button>
                <Button
                  fullWidth variant="outlined"
                  startIcon={<MapRoundedIcon fontSize="small" />}
                  onClick={() => setMapOpen(true)}
                  disabled={detecting || loading}
                  sx={{
                    borderColor: brand.orange, color: brand.orange, fontWeight: 700,
                    textTransform: "none", borderRadius: 1.5, fontSize: "0.82rem",
                    "&:hover": { borderColor: brand.orange, backgroundColor: brand.greenLight },
                  }}
                >
                  Locate on Map
                </Button>
              </Stack>

              <Divider sx={{ my: -0.5 }}>
                <Typography variant="caption" color="text.secondary">or enter manually</Typography>
              </Divider>

              <PlacesAutocompleteField
                value={loc.address}
                onChange={(text) => { setLocField({ address: text }); clrErr("address")(); }}
                onPlaceSelect={({ address, city, state, pincode, lat, lng }) => {
                  setLocField({ address, city, addrState: state, pincode, lat, lng });
                  setErrors((e) => ({ ...e, address: "", city: "", state: "", pincode: "" }));
                }}
                label="Address *"
                error={!!errors.address}
                helperText={errors.address || "Start typing for Google suggestions"}
                disabled={loading}
              />

              <TextField
                fullWidth label="City *" value={loc.city}
                onChange={(e) => { setLocField({ city: e.target.value }); clrErr("city")(); }}
                error={!!errors.city} helperText={errors.city}
                disabled={loading}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth label="State *" value={loc.addrState}
                  onChange={(e) => { setLocField({ addrState: e.target.value }); clrErr("state")(); }}
                  error={!!errors.state} helperText={errors.state}
                  disabled={loading}
                />
                <TextField
                  fullWidth label="Pincode *" value={loc.pincode}
                  inputMode="numeric"
                  onChange={(e) => { setLocField({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }); clrErr("pincode")(); }}
                  error={!!errors.pincode} helperText={errors.pincode}
                  disabled={loading}
                />
              </Stack>

              {/* ── Submit ─────────────────────────────────────────────────── */}
              <Button
                fullWidth type="submit" variant="contained" size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: "1rem", mt: 0.5, ...primaryBtnBaseSx }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Create Account"}
              </Button>

              <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
                Already have an account?{" "}
                <Box component={Link} to="/login"
                  sx={{ color: brand.orange, fontWeight: 700, textDecoration: "none" }}>
                  Sign In
                </Box>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <MapLocationPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialLat={loc.lat}
        initialLng={loc.lng}
      />
    </Box>
  );
}
