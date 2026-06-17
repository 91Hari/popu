import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, Button, IconButton, Card,
  CardContent, Stack, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress,
  Alert, Snackbar, MenuItem, Divider, Grid,
} from "@mui/material";
import LocationOnRoundedIcon      from "@mui/icons-material/LocationOnRounded";
import AddRoundedIcon             from "@mui/icons-material/AddRounded";
import EditRoundedIcon            from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon          from "@mui/icons-material/DeleteRounded";
import MyLocationRoundedIcon      from "@mui/icons-material/MyLocationRounded";
import CheckCircleRoundedIcon     from "@mui/icons-material/CheckCircleRounded";
import ArrowBackRoundedIcon       from "@mui/icons-material/ArrowBackRounded";
import AppLayout               from "../../components/AppLayout";
import PlacesAutocompleteField from "../../components/PlacesAutocompleteField";
import api                     from "../../services/api";
import { ensureMapsInit }      from "../../utils/mapsLoader";
import { parseAddressComponents } from "../../utils/parseAddressComponents";
import { brand } from "../../theme";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli","Daman & Diu",
  "Lakshadweep","Puducherry",
];

const EMPTY_FORM = {
  full_name: "", mobile: "", house_no: "", street: "",
  landmark: "", city: "", state: "", pincode: "", is_default: false,
};

export default function AddressManagementPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [dialog,    setDialog]    = useState({ open: false, mode: "add", data: null });
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [snack,     setSnack]     = useState({ open: false, message: "", severity: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = await api.request("/profile/addresses");
      setAddresses(Array.isArray(list) ? list : []);
    } catch {
      showSnack("Failed to load addresses.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())  e.full_name = "Full name is required";
    if (!form.mobile.trim())     e.mobile    = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.house_no.trim())   e.house_no  = "House / flat number is required";
    if (!form.street.trim())     e.street    = "Street is required";
    if (!form.city.trim())       e.city      = "City is required";
    if (!form.state)             e.state     = "State is required";
    if (!form.pincode.trim())    e.pincode   = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setDialog({ open: true, mode: "add", data: null });
  };

  const openEdit = (addr) => {
    setForm({
      full_name:  addr.full_name  || "",
      mobile:     addr.mobile     || "",
      house_no:   addr.house_no   || "",
      street:     addr.street     || "",
      landmark:   addr.landmark   || "",
      city:       addr.city       || "",
      state:      addr.state      || "",
      pincode:    addr.pincode    || "",
      is_default: addr.is_default || false,
      _lat: addr.latitude, _lng: addr.longitude,
    });
    setErrors({});
    setDialog({ open: true, mode: "edit", data: addr });
  };

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showSnack("Geolocation is not supported by your browser.", "warning");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const ok = await ensureMapsInit("geocoding");
          if (!ok) throw new Error("Maps unavailable");
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === "OK" && results?.[0]) {
              const parsed = parseAddressComponents(results[0].address_components);
              setForm((f) => ({
                ...f,
                street:  parsed.address || f.street,
                city:    parsed.city    || f.city,
                state:   parsed.state   || f.state,
                pincode: parsed.pincode || f.pincode,
                _lat:    latitude,
                _lng:    longitude,
              }));
              showSnack("Location detected. Review and edit the auto-filled fields.");
            } else {
              setForm((f) => ({ ...f, _lat: latitude, _lng: longitude }));
              showSnack("Coordinates captured. Please fill in the address.", "info");
            }
            setDetecting(false);
          });
        } catch {
          setForm((f) => ({ ...f, _lat: latitude, _lng: longitude }));
          showSnack("Could not reverse-geocode location. Please fill manually.", "warning");
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        showSnack(
          err.code === 1 ? "Location permission denied." : "Could not detect location.",
          "warning"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        full_name:  form.full_name.trim(),
        mobile:     form.mobile.trim(),
        house_no:   form.house_no.trim(),
        street:     form.street.trim(),
        landmark:   form.landmark.trim() || null,
        city:       form.city.trim(),
        state:      form.state,
        pincode:    form.pincode.trim(),
        is_default: form.is_default,
        latitude:   form._lat  || null,
        longitude:  form._lng  || null,
      };
      if (dialog.mode === "add") {
        const newAddr = await api.request("/profile/addresses", {
          method: "POST", body: JSON.stringify(payload),
        });
        setAddresses((prev) =>
          form.is_default
            ? [newAddr, ...prev.map((a) => ({ ...a, is_default: false }))]
            : [...prev, newAddr]
        );
        showSnack("Address saved successfully.");
      } else {
        const updated = await api.request(`/profile/addresses/${dialog.data.id}`, {
          method: "PUT", body: JSON.stringify(payload),
        });
        setAddresses((prev) =>
          form.is_default
            ? prev.map((a) => a.id === updated.id ? updated : { ...a, is_default: false })
            : prev.map((a) => a.id === updated.id ? updated : a)
        );
        showSnack("Address updated successfully.");
      }
      setDialog({ open: false, mode: "add", data: null });
    } catch (err) {
      showSnack(err?.message || "Failed to save address.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.request(`/profile/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showSnack("Address deleted.");
    } catch {
      showSnack("Failed to delete address.", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const updated = await api.request(`/profile/addresses/${id}/default`, { method: "PATCH" });
      setAddresses((prev) =>
        prev.map((a) => a.id === updated.id ? updated : { ...a, is_default: false })
      );
      showSnack("Default address updated.");
    } catch {
      showSnack("Failed to update default address.", "error");
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: brand.orange }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <LocationOnRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>My Addresses</Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained" size="small"
            startIcon={<AddRoundedIcon />}
            onClick={openAdd}
            sx={{ fontWeight: 700 }}
          >
            Add New
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : addresses.length === 0 ? (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 5, textAlign: "center" }}>
            <LocationOnRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>No addresses saved</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Add your delivery address to speed up checkout.
            </Typography>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd} sx={{ fontWeight: 700 }}>
              Add First Address
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {addresses.map((addr) => (
              <Card key={addr.id} elevation={0} sx={{
                border: `2px solid ${addr.is_default ? brand.orange : brand.border}`,
                borderRadius: 3,
              }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{addr.full_name}</Typography>
                        {addr.is_default && (
                          <Chip label="Default" size="small" sx={{
                            backgroundColor: brand.orangeLight, color: brand.orange,
                            fontWeight: 700, fontSize: "0.6rem",
                          }} />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>{addr.mobile}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {addr.house_no}, {addr.street}
                        {addr.landmark ? `, ${addr.landmark}` : ""}
                      </Typography>
                      <Typography variant="body2">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => openEdit(addr)} sx={{ color: brand.orange }}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirm(addr.id)} sx={{ color: "#EF5350" }}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                  {!addr.is_default && (
                    <Button
                      size="small" variant="outlined"
                      startIcon={<CheckCircleRoundedIcon fontSize="small" />}
                      onClick={() => handleSetDefault(addr.id)}
                      sx={{ mt: 1.25, fontWeight: 600, fontSize: "0.72rem" }}
                    >
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      {/* Add / Edit dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, mode: "add", data: null })}
        maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {dialog.mode === "add" ? "Add New Address" : "Edit Address"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Button
              variant="outlined" fullWidth
              startIcon={detecting ? <CircularProgress size={16} /> : <MyLocationRoundedIcon />}
              onClick={handleDetectLocation}
              disabled={detecting}
              sx={{ fontWeight: 700, borderColor: brand.orange, color: brand.orange,
                    "&:hover": { borderColor: brand.orange, backgroundColor: brand.orangeLight } }}
            >
              {detecting ? "Detecting location…" : "Detect Current Location"}
            </Button>

            <Divider><Typography variant="caption" sx={{ color: "text.secondary" }}>or fill manually</Typography></Divider>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Full Name *"
                  value={form.full_name} onChange={set("full_name")}
                  error={!!errors.full_name} helperText={errors.full_name} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Mobile Number *"
                  value={form.mobile} onChange={set("mobile")}
                  inputProps={{ maxLength: 10 }}
                  error={!!errors.mobile} helperText={errors.mobile} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="House / Flat No. *"
                  value={form.house_no} onChange={set("house_no")}
                  error={!!errors.house_no} helperText={errors.house_no} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PlacesAutocompleteField
                  value={form.street}
                  onChange={(text) => { setForm((f) => ({ ...f, street: text })); setErrors((e) => ({ ...e, street: "" })); }}
                  onPlaceSelect={({ address, city, state, pincode, lat, lng }) => {
                    setForm((f) => ({
                      ...f,
                      street:  address  || f.street,
                      city:    city     || f.city,
                      state:   state    || f.state,
                      pincode: pincode  || f.pincode,
                      _lat:    lat      ?? f._lat,
                      _lng:    lng      ?? f._lng,
                    }));
                    setErrors((e) => ({ ...e, street: "", city: "", state: "", pincode: "" }));
                  }}
                  label="Street / Area *"
                  error={!!errors.street}
                  helperText={errors.street || "Type for Google suggestions"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Landmark (optional)"
                  value={form.landmark} onChange={set("landmark")} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="City *"
                  value={form.city} onChange={set("city")}
                  error={!!errors.city} helperText={errors.city} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" select label="State *"
                  value={form.state} onChange={set("state")}
                  error={!!errors.state} helperText={errors.state}>
                  {STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Pincode *"
                  value={form.pincode} onChange={set("pincode")}
                  inputProps={{ maxLength: 6 }}
                  error={!!errors.pincode} helperText={errors.pincode} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" select label="Set as default?"
                  value={form.is_default ? "yes" : "no"}
                  onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.value === "yes" }))}>
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes — make this my default address</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog({ open: false, mode: "add", data: null })}>Cancel</Button>
          <Button
            variant="contained" onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ fontWeight: 700 }}
          >
            {saving ? "Saving…" : "Save Address"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Address?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            This address will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteConfirm)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
