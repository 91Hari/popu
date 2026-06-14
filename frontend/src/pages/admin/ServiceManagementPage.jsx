import { useState, useEffect } from "react";
import {
  Container, Box, Typography, Card, CardContent, Stack,
  Switch, Chip, CircularProgress, Alert, Snackbar, Divider,
} from "@mui/material";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
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

export default function ServiceManagementPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(null); // serviceCode being saved
  const [error, setError]       = useState(null);
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    serviceConfigService.adminGetServices()
      .then(setServices)
      .catch(() => setError("Failed to load service configuration."))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (serviceCode, currentValue) => {
    setSaving(serviceCode);
    try {
      const updated = await serviceConfigService.adminUpdateService(serviceCode, !currentValue);
      setServices((prev) =>
        prev.map((s) => s.serviceCode === serviceCode ? { ...s, ...updated } : s)
      );
      setToast(`${updated.serviceName} ${updated.isEnabled ? "enabled" : "disabled"} successfully.`);
    } catch {
      setError("Failed to update service. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <ToggleOnRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Service Management</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Enable or disable customer-facing services. Changes take effect immediately — no deployment required.
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
              {/* Table header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 80px 180px",
                  px: 2.5, py: 1.5,
                  backgroundColor: brand.orangeLight,
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: brand.orange, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Service Name
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: brand.orange, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Status
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: brand.orange, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Toggle
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: brand.orange, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Last Updated
                </Typography>
              </Box>

              {services.map((svc, idx) => (
                <Box key={svc.serviceCode}>
                  {idx > 0 && <Divider sx={{ borderColor: brand.border }} />}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px 80px 180px",
                      px: 2.5, py: 2,
                      alignItems: "center",
                      "&:hover": { backgroundColor: brand.bg },
                      transition: "background-color 0.12s",
                    }}
                  >
                    {/* Service Name */}
                    <Stack spacing={0.25}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {svc.serviceName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled", fontFamily: "monospace" }}>
                        {svc.serviceCode}
                      </Typography>
                    </Stack>

                    {/* Status chip */}
                    <Box>
                      <Chip
                        label={svc.isEnabled ? "Enabled" : "Disabled"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          backgroundColor: svc.isEnabled ? "#E8F5E9" : "#FAFAFA",
                          color: svc.isEnabled ? "#2E7D32" : brand.muted,
                          border: `1px solid ${svc.isEnabled ? "#A5D6A7" : brand.border}`,
                        }}
                      />
                    </Box>

                    {/* Toggle */}
                    <Box>
                      {saving === svc.serviceCode ? (
                        <CircularProgress size={20} sx={{ color: brand.orange, ml: 1 }} />
                      ) : (
                        <Switch
                          checked={svc.isEnabled}
                          onChange={() => handleToggle(svc.serviceCode, svc.isEnabled)}
                          size="small"
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: brand.orange },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.orange },
                          }}
                        />
                      )}
                    </Box>

                    {/* Last updated */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {fmt(svc.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
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
