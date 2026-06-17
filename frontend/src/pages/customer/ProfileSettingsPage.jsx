import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, Button, IconButton, Card,
  TextField, CircularProgress, Alert, Snackbar, MenuItem, Stack,
  Divider, InputAdornment,
} from "@mui/material";
import SettingsRoundedIcon  from "@mui/icons-material/SettingsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon      from "@mui/icons-material/SaveRounded";
import PhoneRoundedIcon     from "@mui/icons-material/PhoneRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import MapRoundedIcon        from "@mui/icons-material/MapRounded";
import AppLayout              from "../../components/AppLayout";
import PlacesAutocompleteField from "../../components/PlacesAutocompleteField";
import MapLocationPicker      from "../../components/MapLocationPicker";
import api                    from "../../services/api";
import { ensureMapsInit }     from "../../utils/mapsLoader";
import { parseAddressComponents } from "../../utils/parseAddressComponents";
import { brand } from "../../theme";

const GENDER_OPTIONS = ["male", "female", "non-binary", "prefer not to say"];

export default function ProfileSettingsPage() {
  const navigate = useNavigate();

  // ── general profile ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});
  const [form, setForm] = useState({
    name: "", phone: "", email: "", date_of_birth: "", gender: "",
  });

  // ── location / address ───────────────────────────────────────────────────────
  const [loc, setLoc]           = useState({ address: "", city: "", addrState: "", pincode: "", lat: null, lng: null });
  const [locErrors, setLocErrors] = useState({});
  const [detecting, setDetecting] = useState(false);
  const [savingLoc, setSavingLoc] = useState(false);
  const [mapOpen, setMapOpen]     = useState(false);

  const setLocField = (fields) => setLoc((f) => ({ ...f, ...fields }));

  const geocodePosition = useCallback(async (latitude, longitude) => {
    try {
      const ok = await ensureMapsInit("geocoding");
      if (!ok) throw new Error("Maps unavailable");
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const parsed = parseAddressComponents(results[0].address_components);
          setLocField({
            address:   parsed.address || "",
            city:      parsed.city    || "",
            addrState: parsed.state   || "",
            pincode:   parsed.pincode || "",
            lat: latitude, lng: longitude,
          });
          showSnack("Location detected — review and save.");
        } else {
          setLocField({ lat: latitude, lng: longitude });
          showSnack("Coordinates captured. Fill in address details.", "info");
        }
        setDetecting(false);
      });
    } catch {
      setLocField({ lat: latitude, lng: longitude });
      showSnack("Could not auto-fill address. Please enter manually.", "warning");
      setDetecting(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showSnack("Geolocation is not supported by your browser.", "warning");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => geocodePosition(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setDetecting(false);
        showSnack(
          err.code === 1
            ? "Location permission denied. Please enter address manually."
            : "Could not detect location. Please enter manually.",
          "warning"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [geocodePosition]);

  // ── mobile number (auth field) ───────────────────────────────────────────────
  const [currentMobile, setCurrentMobile] = useState("");   // displayed read-only label
  const [newMobile,     setNewMobile]     = useState("");   // editable field
  const [mobileError,   setMobileError]   = useState("");
  const [savingMobile,  setSavingMobile]  = useState(false);
  const [mobileEditing, setMobileEditing] = useState(false);

  // ── snackbar ─────────────────────────────────────────────────────────────────
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  // ── load profile ─────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await api.request("/profile");
        setForm({
          name:          data.name          || "",
          phone:         data.phone         || "",
          email:         data.email         || "",
          date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : "",
          gender:        data.gender        || "",
        });
        setCurrentMobile(data.mobile_number || "");
        setNewMobile(data.mobile_number     || "");
        setLocField({
          address:   data.address  || "",
          city:      data.city     || "",
          addrState: data.state    || "",
          pincode:   data.pincode  || "",
          lat:       data.latitude  ?? null,
          lng:       data.longitude ?? null,
        });
      } catch {
        showSnack("Failed to load profile.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── general profile save ─────────────────────────────────────────────────────
  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim()))
      e.email = "Enter a valid email address";
    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth);
      if (isNaN(dob.getTime()))  e.date_of_birth = "Enter a valid date";
      else if (dob > new Date()) e.date_of_birth = "Date of birth cannot be in the future";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await api.request("/profile", {
        method: "PUT",
        body: JSON.stringify({
          name:          form.name.trim(),
          phone:         form.phone.trim(),
          email:         form.email.trim(),
          date_of_birth: form.date_of_birth || null,
          gender:        form.gender        || null,
        }),
      });
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...stored,
          name:  updated.name,
          email: updated.email,
          phone: updated.phone,
        }));
      } catch {}
      showSnack("Profile updated successfully.");
    } catch (err) {
      showSnack(err?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMapConfirm = ({ address, city, state, pincode, lat, lng }) => {
    setLocField({ address, city, addrState: state, pincode, lat, lng });
    setLocErrors({});
    showSnack("Location pinned on map — review and save.");
  };

  // ── location save ────────────────────────────────────────────────────────────
  const validateLoc = () => {
    const e = {};
    if (!loc.address.trim())                      e.address = "Address is required";
    if (!loc.city.trim())                         e.city    = "City is required";
    if (!loc.addrState.trim())                    e.state   = "State is required";
    if (!loc.pincode.trim())                      e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(loc.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    setLocErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveLoc = async () => {
    if (!validateLoc()) return;
    setSavingLoc(true);
    try {
      await api.request("/profile", {
        method: "PUT",
        body: JSON.stringify({
          address:   loc.address.trim()   || null,
          city:      loc.city.trim()      || null,
          state:     loc.addrState.trim() || null,
          pincode:   loc.pincode.trim()   || null,
          latitude:  loc.lat  ?? null,
          longitude: loc.lng  ?? null,
        }),
      });
      showSnack("Location saved successfully.");
    } catch (err) {
      showSnack(err?.message || "Failed to save location.", "error");
    } finally {
      setSavingLoc(false);
    }
  };

  // ── mobile number save ───────────────────────────────────────────────────────
  const handleMobileSave = async () => {
    const trimmed = newMobile.replace(/\D/g, "");
    if (!trimmed) { setMobileError("Mobile number is required"); return; }
    if (!/^\d{10}$/.test(trimmed)) { setMobileError("Enter a valid 10-digit mobile number"); return; }

    setMobileError("");
    setSavingMobile(true);
    try {
      const result = await api.request("/profile/update-mobile", {
        method: "PUT",
        body: JSON.stringify({ mobileNumber: trimmed }),
      });

      // Refresh JWT and localStorage so new mobile works for login immediately
      if (result.token) {
        localStorage.setItem("token", result.token);
      }
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...stored,
          mobile_number: trimmed,
        }));
      } catch {}

      setCurrentMobile(trimmed);
      setNewMobile(trimmed);
      setMobileEditing(false);
      showSnack(result.message || "Mobile number updated successfully.");
    } catch (err) {
      setMobileError(err?.message || "Failed to update mobile number.");
    } finally {
      setSavingMobile(false);
    }
  };

  const handleMobileCancel = () => {
    setNewMobile(currentMobile);
    setMobileError("");
    setMobileEditing(false);
  };

  const sectionLabel = {
    fontWeight: 700,
    mb: 1.5,
    color: "text.secondary",
    textTransform: "uppercase",
    fontSize: "0.7rem",
    letterSpacing: 1,
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: brand.orange }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <SettingsRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Settings</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* ── Mobile Number ──────────────────────────────────────────────── */}
            <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 3 }}>
              <Typography variant="subtitle2" sx={sectionLabel}>
                Mobile Number
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                Used to sign in. Changing this will update your login credentials immediately.
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Mobile Number"
                value={newMobile}
                onChange={(e) => {
                  setNewMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setMobileError("");
                  setMobileEditing(true);
                }}
                inputMode="numeric"
                disabled={savingMobile}
                error={!!mobileError}
                helperText={mobileError}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneRoundedIcon sx={{ fontSize: 16, color: brand.orange }} />
                        <Typography sx={{ ml: 0.5, color: "text.secondary", fontWeight: 600, fontSize: "0.85rem" }}>
                          +91
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {mobileEditing && (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleMobileSave}
                    disabled={savingMobile}
                    startIcon={savingMobile ? <CircularProgress size={14} color="inherit" /> : null}
                    sx={{
                      fontWeight: 700,
                      textTransform: "none",
                      background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
                      "&:hover": { background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)` },
                      "&.Mui-disabled": { background: "#E0E0E0" },
                    }}
                  >
                    {savingMobile ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleMobileCancel}
                    disabled={savingMobile}
                    sx={{
                      fontWeight: 600,
                      textTransform: "none",
                      borderColor: brand.border,
                      color: "text.secondary",
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              )}
            </Card>

            {/* ── Location / Address ────────────────────────────────────────── */}
            <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 3 }}>
              <Typography variant="subtitle2" sx={sectionLabel}>Location / Address</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                Stored for delivery, ETA calculations, and nearby search.
              </Typography>

              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    fullWidth variant="outlined"
                    startIcon={detecting
                      ? <CircularProgress size={15} sx={{ color: brand.orange }} />
                      : <MyLocationRoundedIcon fontSize="small" />}
                    onClick={handleDetectLocation}
                    disabled={detecting || savingLoc}
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
                    disabled={detecting || savingLoc}
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
                  onChange={(text) => { setLocField({ address: text }); setLocErrors((e) => ({ ...e, address: "" })); }}
                  onPlaceSelect={({ address, city, state, pincode, lat, lng }) => {
                    setLocField({ address, city, addrState: state, pincode, lat, lng });
                    setLocErrors({});
                  }}
                  label="Address"
                  error={!!locErrors.address}
                  helperText={locErrors.address || "Start typing for Google suggestions"}
                  disabled={savingLoc}
                />

                <TextField
                  fullWidth size="small" label="City"
                  value={loc.city}
                  onChange={(e) => { setLocField({ city: e.target.value }); setLocErrors((er) => ({ ...er, city: "" })); }}
                  error={!!locErrors.city} helperText={locErrors.city}
                  disabled={savingLoc}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth size="small" label="State"
                    value={loc.addrState}
                    onChange={(e) => { setLocField({ addrState: e.target.value }); setLocErrors((er) => ({ ...er, state: "" })); }}
                    error={!!locErrors.state} helperText={locErrors.state}
                    disabled={savingLoc}
                  />
                  <TextField
                    fullWidth size="small" label="Pincode"
                    value={loc.pincode}
                    inputMode="numeric"
                    onChange={(e) => { setLocField({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }); setLocErrors((er) => ({ ...er, pincode: "" })); }}
                    error={!!locErrors.pincode} helperText={locErrors.pincode}
                    disabled={savingLoc}
                  />
                </Stack>

                <Button
                  variant="contained" size="large" fullWidth
                  startIcon={savingLoc ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                  onClick={handleSaveLoc}
                  disabled={savingLoc}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  {savingLoc ? "Saving…" : "Save Location"}
                </Button>
              </Stack>
            </Card>

            {/* ── Personal Info ──────────────────────────────────────────────── */}
            <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle2" sx={sectionLabel}>
                    Personal Info
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth size="small" label="Full Name *"
                      value={form.name} onChange={set("name")}
                      error={!!errors.name} helperText={errors.name}
                    />
                    <TextField
                      fullWidth size="small" label="Email Address"
                      type="email" value={form.email} onChange={set("email")}
                      error={!!errors.email} helperText={errors.email}
                    />
                    <TextField
                      fullWidth size="small" label="Phone (alternate)"
                      value={form.phone} onChange={set("phone")}
                      inputProps={{ maxLength: 15 }}
                      helperText="Optional alternate contact number"
                    />
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={sectionLabel}>
                    Optional Details
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth size="small" label="Date of Birth"
                      type="date" value={form.date_of_birth} onChange={set("date_of_birth")}
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.date_of_birth} helperText={errors.date_of_birth}
                    />
                    <TextField
                      fullWidth size="small" select label="Gender"
                      value={form.gender} onChange={set("gender")}
                    >
                      <MenuItem value=""><em>Prefer not to say</em></MenuItem>
                      {GENDER_OPTIONS.map((g) => (
                        <MenuItem key={g} value={g} sx={{ textTransform: "capitalize" }}>
                          {g}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Box>

                <Button
                  fullWidth variant="contained" size="large"
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ fontWeight: 700, mt: 1 }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </Stack>
            </Card>
          </Stack>
        )}
      </Container>

      <MapLocationPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialLat={loc.lat}
        initialLng={loc.lng}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
