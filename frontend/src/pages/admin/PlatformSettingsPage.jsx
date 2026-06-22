import { useState, useEffect } from "react";
import {
  Container, Box, Typography, Card, CardContent, Stack,
  Switch, FormControlLabel, TextField, Button, CircularProgress,
  Alert, Divider, Chip, Snackbar, InputAdornment,
} from "@mui/material";
import TuneRoundedIcon            from "@mui/icons-material/TuneRounded";
import PercentRoundedIcon         from "@mui/icons-material/PercentRounded";
import CurrencyRupeeRoundedIcon   from "@mui/icons-material/CurrencyRupeeRounded";
import InfoOutlinedIcon           from "@mui/icons-material/InfoOutlined";
import CheckCircleRoundedIcon     from "@mui/icons-material/CheckCircleRounded";
import DirectionsWalkRoundedIcon  from "@mui/icons-material/DirectionsWalkRounded";
import AppLayout from "../../components/AppLayout";
import platformSettingsService from "../../services/platformSettingsService";
import { brand } from "../../theme";

function SectionHeader({ title, subtitle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>{subtitle}</Typography>
      )}
    </Box>
  );
}

function PayoutPreview({ commissionEnabled, commissionPct, feeEnabled, feeAmount }) {
  const total = 1000;
  const commission = commissionEnabled ? Math.round(total * Number(commissionPct || 0) / 100 * 100) / 100 : 0;
  const fee        = feeEnabled ? Number(feeAmount || 0) : 0;
  const payout     = Math.max(0, total - commission - fee);

  return (
    <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, backgroundColor: brand.orangeLight }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: brand.orange, display: "block", mb: 1.5 }}>
          EXAMPLE: ₹1,000 ORDER
        </Typography>
        <Stack spacing={0.75}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Order Total</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{total.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Commission {commissionEnabled && commissionPct > 0 ? `(${commissionPct}%)` : "(disabled)"}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: commission > 0 ? "#C62828" : "text.disabled" }}>
              − ₹{commission.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Platform Fee {feeEnabled && fee > 0 ? "" : "(disabled)"}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: fee > 0 ? "#C62828" : "text.disabled" }}>
              − ₹{fee.toFixed(2)}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>Caterer Payout</Typography>
            <Typography variant="body2" sx={{ fontWeight: 900, color: brand.green, fontSize: "1rem" }}>
              ₹{payout.toFixed(2)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState({
    commission_enabled:            false,
    commission_percentage:         0,
    platform_fee_enabled:          false,
    platform_fee_amount:           0,
    pickup_recommendation_enabled: true,
    pickup_radius_km:              3.0,
    pickup_min_saving:             0,
  });
  const [loading,  setSaving]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [snack,      setSnack]     = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    platformSettingsService.getSettings()
      .then((s) => {
        setSettings({
          commission_enabled:            s.commission_enabled            ?? false,
          commission_percentage:         s.commission_percentage         ?? 0,
          platform_fee_enabled:          s.platform_fee_enabled          ?? false,
          platform_fee_amount:           s.platform_fee_amount           ?? 0,
          pickup_recommendation_enabled: s.pickup_recommendation_enabled ?? true,
          pickup_radius_km:              s.pickup_radius_km              ?? 3.0,
          pickup_min_saving:             s.pickup_min_saving             ?? 0,
        });
      })
      .catch(() => setSnack({ open: true, message: "Failed to load settings.", severity: "error" }))
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await platformSettingsService.updateSettings(settings);
      setSettings({
        commission_enabled:            updated.commission_enabled,
        commission_percentage:         updated.commission_percentage,
        platform_fee_enabled:          updated.platform_fee_enabled,
        platform_fee_amount:           updated.platform_fee_amount,
        pickup_recommendation_enabled: updated.pickup_recommendation_enabled ?? true,
        pickup_radius_km:              updated.pickup_radius_km              ?? 3.0,
        pickup_min_saving:             updated.pickup_min_saving             ?? 0,
      });
      setSnack({ open: true, message: "Settings saved. New orders will use updated rates.", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to save settings.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (val) => setSettings((s) => ({ ...s, [key]: val }));

  if (fetching) {
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
      <Container maxWidth="md" sx={{ pt: 3, pb: 6 }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <TuneRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Platform Settings</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Configure commission and platform fees. Changes apply to new orders only.
          Existing orders are unaffected.
        </Typography>

        {/* Current Phase Banner */}
        <Alert
          severity="info"
          icon={<CheckCircleRoundedIcon />}
          sx={{ mb: 3, borderRadius: 2, "& .MuiAlert-message": { fontWeight: 500 } }}
        >
          <strong>MVP Phase — Zero Commission.</strong> PO.PU currently charges no commission, no service fee,
          and no platform fee. Payments go directly to caterers.
        </Alert>

        <Stack spacing={3}>

          {/* Commission */}
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                title="Commission"
                subtitle="Percentage of each order total collected as platform revenue."
              />
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(settings.commission_enabled)}
                      onChange={(e) => set("commission_enabled")(e.target.checked)}
                      sx={{ "& .MuiSwitch-thumb": { backgroundColor: settings.commission_enabled ? brand.orange : undefined } }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Commission</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {settings.commission_enabled ? "Commission is active" : "Currently disabled — caterers receive 100% of order value"}
                      </Typography>
                    </Box>
                  }
                />
                <TextField
                  size="small"
                  label="Commission Percentage"
                  type="number"
                  value={settings.commission_percentage}
                  onChange={(e) => set("commission_percentage")(Math.min(100, Math.max(0, Number(e.target.value))))}
                  disabled={!settings.commission_enabled}
                  inputProps={{ min: 0, max: 100, step: 0.5 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><PercentRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                  }}
                  sx={{ maxWidth: 240 }}
                  helperText="Enter 0–100. Example: 5 = 5% of order total."
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Platform Fee */}
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                title="Platform Fee"
                subtitle="Fixed amount deducted per caterer sub-order as a flat service charge."
              />
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(settings.platform_fee_enabled)}
                      onChange={(e) => set("platform_fee_enabled")(e.target.checked)}
                      sx={{ "& .MuiSwitch-thumb": { backgroundColor: settings.platform_fee_enabled ? brand.orange : undefined } }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Platform Fee</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {settings.platform_fee_enabled ? "Platform fee is active" : "Currently disabled — no flat fee charged"}
                      </Typography>
                    </Box>
                  }
                />
                <TextField
                  size="small"
                  label="Platform Fee Amount (₹)"
                  type="number"
                  value={settings.platform_fee_amount}
                  onChange={(e) => set("platform_fee_amount")(Math.max(0, Number(e.target.value)))}
                  disabled={!settings.platform_fee_enabled}
                  inputProps={{ min: 0, step: 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CurrencyRupeeRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                  }}
                  sx={{ maxWidth: 240 }}
                  helperText="Fixed rupee amount per sub-order. Example: ₹20."
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Self-Pickup Recommendation */}
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <DirectionsWalkRoundedIcon sx={{ color: brand.orange, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Self-Pickup Recommendation</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                Suggest self-pickup to customers who are close to a caterer, saving them the delivery charge.
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(settings.pickup_recommendation_enabled)}
                      onChange={(e) => set("pickup_recommendation_enabled")(e.target.checked)}
                      sx={{ "& .MuiSwitch-thumb": { backgroundColor: settings.pickup_recommendation_enabled ? brand.orange : undefined } }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Pickup Recommendation</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {settings.pickup_recommendation_enabled
                          ? "Eligible customers will see a pickup suggestion at checkout"
                          : "Pickup recommendations are hidden from all customers"}
                      </Typography>
                    </Box>
                  }
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    label="Max Distance (km)"
                    type="number"
                    value={settings.pickup_radius_km}
                    onChange={(e) => set("pickup_radius_km")(Math.max(0.1, Number(e.target.value)))}
                    disabled={!settings.pickup_recommendation_enabled}
                    inputProps={{ min: 0.1, max: 50, step: 0.5 }}
                    helperText="Show pickup only if caterer is within this distance."
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Min Saving Threshold (₹)"
                    type="number"
                    value={settings.pickup_min_saving}
                    onChange={(e) => set("pickup_min_saving")(Math.max(0, Number(e.target.value)))}
                    disabled={!settings.pickup_recommendation_enabled}
                    inputProps={{ min: 0, step: 1 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CurrencyRupeeRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                    }}
                    helperText="Only suggest if saving exceeds this amount."
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Live Payout Preview */}
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                title="Payout Preview"
                subtitle="How the current settings affect a ₹1,000 order."
              />
              <PayoutPreview
                commissionEnabled={settings.commission_enabled}
                commissionPct={settings.commission_percentage}
                feeEnabled={settings.platform_fee_enabled}
                feeAmount={settings.platform_fee_amount}
              />
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: brand.orange }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Platform Policy</Typography>
                <Chip label="Currently Active" size="small" color="success" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
              </Box>
              <Box
                sx={{
                  p: 2, borderRadius: 1.5,
                  backgroundColor: "#F9F9F9",
                  border: `1px solid ${brand.border}`,
                  fontFamily: "monospace", fontSize: "0.82rem", lineHeight: 1.8,
                  color: "text.secondary",
                }}
              >
                "PO.PU currently charges no commission, no service fee, and no platform fee.
                Payments are made directly to participating caterers.
                PO.PU acts as a technology platform connecting customers and food providers."
              </Box>
            </CardContent>
          </Card>

          {/* Save */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained" size="large"
              onClick={handleSave}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`,
                fontWeight: 800, px: 5, textTransform: "none",
              }}
            >
              {loading ? "Saving…" : "Save Settings"}
            </Button>
          </Box>
        </Stack>

      </Container>

      <Snackbar
        open={snack.open} autoHideDuration={4000}
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
