import { useState, useEffect } from "react";
import {
  Container, Box, Typography, Card, CardContent, Stack,
  Switch, Chip, CircularProgress, Alert, Snackbar, Divider,
  TextField, Tooltip,
} from "@mui/material";
import ToggleOnRoundedIcon   from "@mui/icons-material/ToggleOnRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AppLayout from "../../components/AppLayout";
import serviceConfigService from "../../services/serviceConfigService";
import { brand } from "../../theme";

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function statusChip(isEnabled, isComingSoon) {
  if (isEnabled)    return { label: "Enabled",     bg: "#E8F5E9", color: "#2E7D32", border: "#A5D6A7" };
  if (isComingSoon) return { label: "Coming Soon", bg: "#FFF8E1", color: "#F57F17", border: "#FFD54F" };
  return               { label: "Disabled",    bg: "#FAFAFA",  color: brand.muted, border: brand.border };
}

export default function ServiceManagementPage() {
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(null); // "<serviceCode>_<field>"
  const [error, setError]         = useState(null);
  const [toast, setToast]         = useState(null);
  const [localOrder, setLocalOrder] = useState({}); // { [serviceCode]: string }

  useEffect(() => {
    serviceConfigService.adminGetServices()
      .then((svcs) => {
        setServices(svcs);
        const init = {};
        svcs.forEach((s) => { init[s.serviceCode] = String(s.displayOrder ?? 0); });
        setLocalOrder(init);
      })
      .catch(() => setError("Failed to load service configuration."))
      .finally(() => setLoading(false));
  }, []);

  const patch = async (serviceCode, serviceName, field, data, toastMsg) => {
    setSaving(`${serviceCode}_${field}`);
    try {
      const updated = await serviceConfigService.adminUpdateService(serviceCode, data);
      setServices((prev) =>
        prev.map((s) => s.serviceCode === serviceCode ? { ...s, ...updated } : s)
      );
      setToast(toastMsg || `${serviceName} updated.`);
    } catch {
      setError("Failed to update service. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleToggleEnabled = (svc) =>
    patch(svc.serviceCode, svc.serviceName, "enabled",
      { isEnabled: !svc.isEnabled },
      `${svc.serviceName} ${!svc.isEnabled ? "enabled" : "disabled"}.`);

  const handleToggleComingSoon = (svc) =>
    patch(svc.serviceCode, svc.serviceName, "coming",
      { isComingSoon: !svc.isComingSoon },
      `"Coming Soon" ${!svc.isComingSoon ? "enabled" : "disabled"} for ${svc.serviceName}.`);

  const handleOrderBlur = (svc) => {
    const n = parseInt(localOrder[svc.serviceCode] ?? "0", 10);
    if (isNaN(n) || n === (svc.displayOrder ?? 0)) return;
    patch(svc.serviceCode, svc.serviceName, "order",
      { displayOrder: n },
      `Display order updated for ${svc.serviceName}.`);
  };

  const isSaving = (code, field) => saving === `${code}_${field}`;

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <ToggleOnRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Service Management</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Enable, disable, or mark services as Coming Soon. Display order controls the sort on the customer services page.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              {/* Header row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 80px 110px 80px 170px",
                  px: 2.5, py: 1.5,
                  backgroundColor: brand.orangeLight,
                  borderRadius: "12px 12px 0 0",
                }}
              >
                {["Service", "Status", "Enable", "Coming Soon", "Order", "Last Updated"].map((h) => (
                  <Typography key={h} variant="caption"
                    sx={{ fontWeight: 800, color: brand.orange, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              {services.map((svc, idx) => {
                const chip = statusChip(svc.isEnabled, svc.isComingSoon);
                return (
                  <Box key={svc.serviceCode}>
                    {idx > 0 && <Divider sx={{ borderColor: brand.border }} />}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 120px 80px 110px 80px 170px",
                        px: 2.5, py: 2,
                        alignItems: "center",
                        "&:hover": { backgroundColor: brand.bg },
                        transition: "background-color 0.12s",
                      }}
                    >
                      {/* Service Name */}
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{svc.serviceName}</Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", fontFamily: "monospace" }}>
                          {svc.serviceCode}
                        </Typography>
                      </Stack>

                      {/* Status chip */}
                      <Box>
                        <Chip label={chip.label} size="small"
                          sx={{ fontWeight: 700, fontSize: "0.7rem",
                                backgroundColor: chip.bg, color: chip.color,
                                border: `1px solid ${chip.border}` }} />
                      </Box>

                      {/* Enable toggle */}
                      <Box>
                        {isSaving(svc.serviceCode, "enabled") ? (
                          <CircularProgress size={20} sx={{ color: brand.orange, ml: 1 }} />
                        ) : (
                          <Tooltip title={svc.isEnabled ? "Disable service" : "Enable service"}>
                            <Switch
                              checked={svc.isEnabled}
                              onChange={() => handleToggleEnabled(svc)}
                              size="small"
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: brand.orange },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.orange },
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>

                      {/* Coming Soon toggle — only relevant when disabled */}
                      <Box>
                        {isSaving(svc.serviceCode, "coming") ? (
                          <CircularProgress size={20} sx={{ color: "#F57F17", ml: 1 }} />
                        ) : (
                          <Tooltip title={svc.isEnabled ? "Disable the service first to use Coming Soon" : (svc.isComingSoon ? "Hide Coming Soon badge" : "Show Coming Soon badge")}>
                            <span>
                              <Switch
                                checked={svc.isComingSoon}
                                onChange={() => handleToggleComingSoon(svc)}
                                disabled={svc.isEnabled}
                                size="small"
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#F57F17" },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#F57F17" },
                                }}
                              />
                            </span>
                          </Tooltip>
                        )}
                      </Box>

                      {/* Display Order */}
                      <Box>
                        <TextField
                          type="number"
                          size="small"
                          value={localOrder[svc.serviceCode] ?? "0"}
                          onChange={(e) => setLocalOrder((p) => ({ ...p, [svc.serviceCode]: e.target.value }))}
                          onBlur={() => handleOrderBlur(svc)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.target.blur(); } }}
                          disabled={isSaving(svc.serviceCode, "order")}
                          slotProps={{ htmlInput: { min: 0, style: { textAlign: "center", padding: "4px 6px", width: 48 } } }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                        />
                      </Box>

                      {/* Last Updated */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccessTimeRoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {fmt(svc.updatedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        )}

      </Container>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={toast}
      />
    </AppLayout>
  );
}
