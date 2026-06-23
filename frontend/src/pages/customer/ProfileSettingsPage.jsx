import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, Button, IconButton, Card,
  TextField, CircularProgress, Alert, Snackbar, MenuItem, Stack,
  Divider, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from "@mui/material";
import SettingsRoundedIcon       from "@mui/icons-material/SettingsRounded";
import SaveRoundedIcon           from "@mui/icons-material/SaveRounded";
import PhoneRoundedIcon          from "@mui/icons-material/PhoneRounded";
import MyLocationRoundedIcon     from "@mui/icons-material/MyLocationRounded";
import MapRoundedIcon            from "@mui/icons-material/MapRounded";
import DeleteForeverRoundedIcon  from "@mui/icons-material/DeleteForeverRounded";
import WarningAmberRoundedIcon   from "@mui/icons-material/WarningAmberRounded";
import LockRoundedIcon           from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon     from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon  from "@mui/icons-material/VisibilityOffRounded";
import authService               from "../../services/authService";
import { requestLocation }    from "../../services/locationService";
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

  const handleDetectLocation = useCallback(async () => {
    setDetecting(true);
    const safetyTimer = setTimeout(() => {
      setDetecting(false);
      showSnack("Location detection timed out. Use the map or enter address manually.", "warning");
    }, 18000);

    try {
      const { latitude, longitude } = await requestLocation();
      clearTimeout(safetyTimer);
      geocodePosition(latitude, longitude);
    } catch (err) {
      clearTimeout(safetyTimer);
      setDetecting(false);
      showSnack(
        err.code === 1
          ? "Location permission denied. Please enable location access from settings."
          : "Could not detect location. Please enter manually.",
        "warning"
      );
    }
  }, [geocodePosition]);

  // ── mobile number (auth field) ───────────────────────────────────────────────
  const [currentMobile, setCurrentMobile] = useState("");   // displayed read-only label
  const [newMobile,     setNewMobile]     = useState("");   // editable field
  const [mobileError,   setMobileError]   = useState("");
  const [savingMobile,  setSavingMobile]  = useState(false);
  const [mobileEditing, setMobileEditing] = useState(false);

  // ── change password ──────────────────────────────────────────────────────────
  const [pwForm, setPwForm]       = useState({ current: "", newPw: "", confirm: "" });
  const [pwErrors, setPwErrors]   = useState({});
  const [savingPw, setSavingPw]   = useState(false);
  const [showPw, setShowPw]       = useState({ current: false, newPw: false, confirm: false });

  const togglePw = (field) => setShowPw((s) => ({ ...s, [field]: !s[field] }));
  const eyeIcon  = (field) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={() => togglePw(field)} edge="end" size="small" tabIndex={-1}>
          {showPw[field]
            ? <VisibilityOffRoundedIcon fontSize="small" />
            : <VisibilityRoundedIcon fontSize="small" />}
        </IconButton>
      </InputAdornment>
    ),
  });

  const handleChangePassword = async () => {
    const errs = {};
    if (!pwForm.current)   errs.current  = "Enter your current password";
    if (!pwForm.newPw)     errs.newPw    = "Enter a new password";
    if (pwForm.newPw && pwForm.newPw.length < 8)
      errs.newPw = "Password must be at least 8 characters";
    if (pwForm.newPw !== pwForm.confirm) errs.confirm = "Passwords do not match";
    setPwErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingPw(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      showSnack("Password changed. Please sign in again.");
      setPwForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }, 1500);
    } catch (err) {
      if (err?.status === 401 || err?.message?.toLowerCase().includes("session")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      showSnack(err?.message || "Failed to change password.", "error");
    } finally {
      setSavingPw(false);
    }
  };

  // ── danger zone ──────────────────────────────────────────────────────────────
  const userRole = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user"))?.role?.toUpperCase() || ""; } catch { return ""; }
  }, []);
  const [deleteDlg, setDeleteDlg]           = useState(false);
  const [deleteConfirm, setDeleteConfirm]   = useState("");
  const [deleting, setDeleting]             = useState(false);
  const [closureReason, setClosureReason]   = useState("");
  const [submittingClosure, setSubmittingClosure] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await api.request("/account/request-delete", { method: "POST" });
      showSnack("Account deleted. You will be signed out.");
      setTimeout(() => {
        localStorage.clear();
        navigate("/login");
      }, 1500);
    } catch (err) {
      showSnack(err?.message || "Failed to delete account.", "error");
      setDeleting(false);
    }
  };

  const handleClosureSubmit = async () => {
    setSubmittingClosure(true);
    try {
      const res = await api.request("/account/request-closure", {
        method: "POST",
        body: JSON.stringify({ reason: closureReason.trim() || undefined }),
      });
      showSnack(res.message || "Closure request submitted.");
      setClosureReason("");
    } catch (err) {
      showSnack(err?.message || "Failed to submit closure request.", "error");
    } finally {
      setSubmittingClosure(false);
    }
  };

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

            {/* ── Security / Change Password ────────────────────────────────── */}
            <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <LockRoundedIcon sx={{ color: brand.orange, fontSize: 18 }} />
                <Typography variant="subtitle2" sx={sectionLabel}>Security</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                After changing your password you will be signed out and need to log in again.
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth size="small" label="Current Password"
                  type={showPw.current ? "text" : "password"}
                  value={pwForm.current}
                  onChange={(e) => { setPwForm((f) => ({ ...f, current: e.target.value })); setPwErrors((er) => ({ ...er, current: "" })); }}
                  error={!!pwErrors.current} helperText={pwErrors.current}
                  disabled={savingPw}
                  autoComplete="current-password"
                  slotProps={{ input: eyeIcon("current") }}
                />
                <TextField
                  fullWidth size="small" label="New Password"
                  type={showPw.newPw ? "text" : "password"}
                  value={pwForm.newPw}
                  onChange={(e) => { setPwForm((f) => ({ ...f, newPw: e.target.value })); setPwErrors((er) => ({ ...er, newPw: "" })); }}
                  error={!!pwErrors.newPw}
                  helperText={pwErrors.newPw || "Min 8 chars, uppercase, lowercase, number, special char"}
                  disabled={savingPw}
                  autoComplete="new-password"
                  slotProps={{ input: eyeIcon("newPw") }}
                />
                <TextField
                  fullWidth size="small" label="Confirm New Password"
                  type={showPw.confirm ? "text" : "password"}
                  value={pwForm.confirm}
                  onChange={(e) => { setPwForm((f) => ({ ...f, confirm: e.target.value })); setPwErrors((er) => ({ ...er, confirm: "" })); }}
                  error={!!pwErrors.confirm} helperText={pwErrors.confirm}
                  disabled={savingPw}
                  autoComplete="new-password"
                  slotProps={{ input: eyeIcon("confirm") }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleChangePassword}
                  disabled={savingPw}
                  startIcon={savingPw ? <CircularProgress size={14} color="inherit" /> : <LockRoundedIcon />}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    alignSelf: "flex-start",
                    background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
                    "&:hover": { background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)` },
                    "&.Mui-disabled": { background: "#E0E0E0" },
                  }}
                >
                  {savingPw ? "Saving…" : "Change Password"}
                </Button>
              </Stack>
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
                      slotProps={{ htmlInput: { maxLength: 15 } }}
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

            {/* ── Danger Zone ───────────────────────────────────────────────── */}
            {(userRole === "CUSTOMER" || userRole === "RIDER" || userRole === "CATERER") && (
              <Card
                elevation={0}
                sx={{ border: "1.5px solid #FFCDD2", borderRadius: 3, p: 3, backgroundColor: "#FFF8F8" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <WarningAmberRoundedIcon sx={{ color: "#C62828", fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#C62828", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1 }}>
                    Danger Zone
                  </Typography>
                </Box>

                {(userRole === "CUSTOMER" || userRole === "RIDER") && (
                  <>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.6 }}>
                      Permanently delete your account. Your data will be retained for 30 days for legal compliance,
                      then anonymized. This cannot be undone once the retention period expires.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteForeverRoundedIcon />}
                      onClick={() => { setDeleteDlg(true); setDeleteConfirm(""); }}
                      sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1.5 }}
                    >
                      Delete My Account
                    </Button>
                  </>
                )}

                {userRole === "CATERER" && (
                  <>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.6 }}>
                      Request to close your caterer account. An admin will review your request. All active
                      orders must be completed or cancelled before closure can be approved.
                    </Typography>
                    <Stack spacing={1.5}>
                      <TextField
                        fullWidth multiline rows={3}
                        size="small"
                        label="Reason for closure (optional)"
                        value={closureReason}
                        onChange={(e) => setClosureReason(e.target.value)}
                        disabled={submittingClosure}
                        sx={{ backgroundColor: "#fff" }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={submittingClosure ? <CircularProgress size={14} color="inherit" /> : <DeleteForeverRoundedIcon />}
                        onClick={handleClosureSubmit}
                        disabled={submittingClosure}
                        sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1.5, alignSelf: "flex-start" }}
                      >
                        {submittingClosure ? "Submitting…" : "Request Account Closure"}
                      </Button>
                    </Stack>
                  </>
                )}
              </Card>
            )}
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

      {/* Delete account confirmation dialog (Customer / Rider) */}
      <Dialog open={deleteDlg} onClose={() => !deleting && setDeleteDlg(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#C62828" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DeleteForeverRoundedIcon /> Delete Account
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2.5, lineHeight: 1.7 }}>
            This will <strong>permanently delete your account</strong>. Your data is retained for 30 days
            then anonymized — orders and payments are kept for compliance. You cannot undo this.
          </DialogContentText>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.75 }}>
            Type <strong>DELETE</strong> to confirm:
          </Typography>
          <TextField
            fullWidth size="small"
            placeholder="DELETE"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            disabled={deleting}
            error={deleteConfirm.length > 0 && deleteConfirm !== "DELETE"}
            sx={{ fontFamily: "monospace", letterSpacing: "0.1em" }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDlg(false)} disabled={deleting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteForeverRoundedIcon />}
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== "DELETE" || deleting}
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            {deleting ? "Deleting…" : "Yes, Delete My Account"}
          </Button>
        </DialogActions>
      </Dialog>

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
