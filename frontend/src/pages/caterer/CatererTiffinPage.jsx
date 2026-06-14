import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Card, CardContent, Stack,
  Switch, FormControlLabel, TextField, Button, Divider,
  Alert, CircularProgress, Snackbar, Chip,
} from "@mui/material";
import DiningIcon from "@mui/icons-material/Dining";
import SaveRoundedIcon          from "@mui/icons-material/SaveRounded";
import AppLayout                from "../../components/AppLayout";
import tiffinService            from "../../services/tiffinService";
import { brand }                from "../../theme";

export default function CatererTiffinPage() {
  const [settings,  setSettings]  = useState(null);
  const [foods,     setFoods]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [mapSaving, setMapSaving] = useState(false);
  const [error,     setError]     = useState("");
  const [snack,     setSnack]     = useState({ open: false, message: "", severity: "success" });

  const [enabled,    setEnabled]    = useState(false);
  const [price1,     setPrice1]     = useState("80");
  const [price2,     setPrice2]     = useState("120");
  const [price3,     setPrice3]     = useState("180");
  const [foodMap,    setFoodMap]    = useState({});

  const load = useCallback(async () => {
    try {
      const [settingsRes, foodsRes] = await Promise.all([
        tiffinService.getCatererOwnSettings(),
        tiffinService.getCatererFoods(),
      ]);
      const s = settingsRes.settings;
      const f = foodsRes.foods || [];
      setSettings(s);
      setFoods(f);
      setEnabled(!!s.tiffin_enabled);
      setPrice1(String(s.one_carriage_price   ?? 80));
      setPrice2(String(s.two_carriage_price   ?? 120));
      setPrice3(String(s.three_carriage_price ?? 180));
      const map = {};
      f.forEach((food) => { map[food.id] = !!food.available_for_tiffin; });
      setFoodMap(map);
    } catch (err) {
      setError(err?.message || "Failed to load tiffin settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveSettings = async () => {
    if (isNaN(Number(price1)) || isNaN(Number(price2)) || isNaN(Number(price3))) {
      setSnack({ open: true, message: "Prices must be valid numbers.", severity: "error" });
      return;
    }
    setSaving(true);
    try {
      await tiffinService.saveSettings({
        tiffin_enabled:       enabled,
        one_carriage_price:   Number(price1),
        two_carriage_price:   Number(price2),
        three_carriage_price: Number(price3),
      });
      setSnack({ open: true, message: "Settings saved!", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to save settings.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFoodMapping = async () => {
    setMapSaving(true);
    try {
      const mappings = foods.map((f) => ({
        food_item_id:         f.id,
        available_for_tiffin: foodMap[f.id] ?? true,
      }));
      await tiffinService.saveFoodMapping(mappings);
      setSnack({ open: true, message: "Food availability saved!", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to save food mapping.", severity: "error" });
    } finally {
      setMapSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <DiningIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Lunch Box Management</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* ─── Enable / Pricing ─────────────────────────────────────────────── */}
        <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Service Settings</Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  sx={{ "& .MuiSwitch-thumb": { backgroundColor: enabled ? brand.orange : undefined } }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Lunch Box Service</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Customers will see you in the Lunch Box caterer list
                  </Typography>
                </Box>
              }
              sx={{ mb: 2.5, alignItems: "flex-start" }}
            />

            <Divider sx={{ mb: 2.5 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Box Pricing</Typography>
            <Stack spacing={2}>
              {[
                { label: "1 Carriage Box (1 item)",  state: price1, set: setPrice1, hint: "e.g. ₹80" },
                { label: "2 Carriage Box (2 items)", state: price2, set: setPrice2, hint: "e.g. ₹120" },
                { label: "3 Carriage Box (3 items)", state: price3, set: setPrice3, hint: "e.g. ₹180" },
              ].map(({ label, state, set, hint }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>{label}</Typography>
                  <TextField
                    size="small"
                    value={state}
                    onChange={(e) => set(e.target.value)}
                    placeholder={hint}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9.]*" }}
                    sx={{ width: 110, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    InputProps={{ startAdornment: <Typography variant="body2" sx={{ mr: 0.5, color: "text.secondary" }}>₹</Typography> }}
                  />
                </Box>
              ))}
            </Stack>

            <Button
              variant="contained" onClick={handleSaveSettings} disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
              sx={{ mt: 2.5, fontWeight: 700 }}
            >
              {saving ? "Saving…" : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* ─── Food Mapping ─────────────────────────────────────────────────── */}
        <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Food Availability for Lunch Box</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {Object.values(foodMap).filter(Boolean).length} of {foods.length} available
              </Typography>
            </Box>

            {foods.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
                Add food items to your menu first, then enable them for Lunch Box here.
              </Alert>
            ) : (
              <Stack spacing={1} sx={{ mb: 2 }}>
                {foods.map((food) => (
                  <Box key={food.id} sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    p: 1.25, borderRadius: 1.5, border: `1px solid ${brand.border}`,
                    backgroundColor: foodMap[food.id] ? brand.greenLight : "#f5f5f5",
                    transition: "background-color 0.15s",
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{food.food_name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>₹{Number(food.price).toFixed(0)}</Typography>
                      {!food.is_available && (
                        <Chip label="Menu Unavailable" size="small"
                          sx={{ ml: 0.75, fontSize: "0.55rem", height: 16 }} />
                      )}
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!foodMap[food.id]}
                          onChange={(e) => setFoodMap((prev) => ({ ...prev, [food.id]: e.target.checked }))}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600, color: foodMap[food.id] ? brand.green : "text.secondary" }}>
                          {foodMap[food.id] ? "Available" : "Not Available"}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}
              </Stack>
            )}

            {foods.length > 0 && (
              <Button
                variant="outlined" onClick={handleSaveFoodMapping} disabled={mapSaving}
                startIcon={mapSaving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
                sx={{ fontWeight: 700, borderColor: brand.orange, color: brand.orange }}
              >
                {mapSaving ? "Saving…" : "Save Food Availability"}
              </Button>
            )}
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
