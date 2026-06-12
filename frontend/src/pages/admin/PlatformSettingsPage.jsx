import { useState, useEffect } from "react";
import {
  Container, Box, Typography, Card, CardContent, Stack,
  Switch, FormControlLabel, TextField, Button, CircularProgress,
  Alert, Divider, Chip, Snackbar, InputAdornment, MenuItem, IconButton,
} from "@mui/material";
import TuneRoundedIcon            from "@mui/icons-material/TuneRounded";
import PercentRoundedIcon         from "@mui/icons-material/PercentRounded";
import CurrencyRupeeRoundedIcon   from "@mui/icons-material/CurrencyRupeeRounded";
import InfoOutlinedIcon           from "@mui/icons-material/InfoOutlined";
import CheckCircleRoundedIcon     from "@mui/icons-material/CheckCircleRounded";
import VisibilityRoundedIcon      from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon   from "@mui/icons-material/VisibilityOffRounded";
import SaveRoundedIcon            from "@mui/icons-material/SaveRounded";
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
    commission_enabled:    false,
    commission_percentage: 0,
    platform_fee_enabled:  false,
    platform_fee_amount:   0,
  });
  const [phonepe, setPhonePe] = useState({
    client_id: "", client_secret: "", env: "uat", client_version: "1",
    secret_set: false, showSecret: false,
  });
  const [loading,    setSaving]    = useState(false);
  const [ppSaving,   setPpSaving]  = useState(false);
  const [fetching,   setFetching]  = useState(true);
  const [snack,      setSnack]     = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    platformSettingsService.getSettings()
      .then((s) => {
        setSettings({
          commission_enabled:    s.commission_enabled    ?? false,
          commission_percentage: s.commission_percentage ?? 0,
          platform_fee_enabled:  s.platform_fee_enabled  ?? false,
          platform_fee_amount:   s.platform_fee_amount   ?? 0,
        });
        setPhonePe((p) => ({
          ...p,
          client_id:      s.phonepe_client_id      || "",
          env:            s.phonepe_env            || "uat",
          client_version: s.phonepe_client_version || "1",
          secret_set:     s.phonepe_secret_set     || false,
        }));
      })
      .catch(() => setSnack({ open: true, message: "Failed to load settings.", severity: "error" }))
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await platformSettingsService.updateSettings(settings);
      setSettings({
        commission_enabled:    updated.commission_enabled,
        commission_percentage: updated.commission_percentage,
        platform_fee_enabled:  updated.platform_fee_enabled,
        platform_fee_amount:   updated.platform_fee_amount,
      });
      setSnack({ open: true, message: "Settings saved. New orders will use updated rates.", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to save settings.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhonePe = async () => {
    setPpSaving(true);
    try {
      const payload = {
        phonepe_client_id:      phonepe.client_id,
        phonepe_client_secret:  phonepe.client_secret, // empty string = keep existing
        phonepe_env:            phonepe.env,
        phonepe_client_version: phonepe.client_version || "1",
      };
      const updated = await platformSettingsService.updateSettings(payload);
      setPhonePe((p) => ({
        ...p,
        client_id:      updated.phonepe_client_id      || p.client_id,
        client_secret:  "",   // clear after save
        env:            updated.phonepe_env            || p.env,
        client_version: updated.phonepe_client_version || p.client_version,
        secret_set:     updated.phonepe_secret_set     ?? p.secret_set,
      }));
      setSnack({ open: true, message: "PhonePe credentials saved.", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to save PhonePe credentials.", severity: "error" });
    } finally {
      setPpSaving(false);
    }
  };

  const set = (key) => (val) => setSettings((s) => ({ ...s, [key]: val }));
  const setPp = (key) => (e) => setPhonePe((p) => ({ ...p, [key]: e.target.value }));

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

          {/* PhonePe Credentials */}
          <Card elevation={0} sx={{ border: `2px solid #e8e0f7`, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #5A4EE8, #7B6CF0)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.6rem" }}>Pe</Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>PhonePe API Credentials</Typography>
                {phonepe.secret_set && !phonepe.client_secret && (
                  <Chip label="Configured" size="small" color="success" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                )}
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
                Stored in the database — no server restart or Render env vars needed.
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth size="small" label="Client ID"
                  placeholder="e.g. PGTESTPAYUAT"
                  value={phonepe.client_id}
                  onChange={setPp("client_id")}
                />
                <TextField
                  fullWidth size="small" label="Client Secret"
                  type={phonepe.showSecret ? "text" : "password"}
                  placeholder={phonepe.secret_set ? "Secret saved — type to replace" : "Enter client secret"}
                  value={phonepe.client_secret}
                  onChange={setPp("client_secret")}
                  helperText="Leave blank to keep the existing secret."
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setPhonePe((p) => ({ ...p, showSecret: !p.showSecret }))}>
                          {phonepe.showSecret ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small" select label="Environment"
                    value={phonepe.env}
                    onChange={setPp("env")}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="uat">UAT (Test)</MenuItem>
                    <MenuItem value="production">Production</MenuItem>
                  </TextField>
                  <TextField
                    size="small" label="Client Version"
                    value={phonepe.client_version}
                    onChange={setPp("client_version")}
                    sx={{ width: 120 }}
                  />
                </Stack>

                <Box>
                  <Button
                    variant="contained" onClick={handleSavePhonePe} disabled={ppSaving}
                    startIcon={ppSaving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
                    sx={{
                      background: "linear-gradient(135deg, #5A4EE8, #7B6CF0)",
                      fontWeight: 700, textTransform: "none",
                    }}
                  >
                    {ppSaving ? "Saving…" : "Save PhonePe Credentials"}
                  </Button>
                </Box>
              </Stack>
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
