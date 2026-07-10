import { useCallback, useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  Grid, Typography,
} from "@mui/material";
import RefreshRoundedIcon        from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon          from "@mui/icons-material/ErrorRounded";
import HelpOutlineRoundedIcon    from "@mui/icons-material/HelpOutlineRounded";
import StorageRoundedIcon        from "@mui/icons-material/StorageRounded";
import EmailRoundedIcon          from "@mui/icons-material/EmailRounded";
import PaymentsRoundedIcon       from "@mui/icons-material/PaymentsRounded";
import MapRoundedIcon            from "@mui/icons-material/MapRounded";
import CloudRoundedIcon          from "@mui/icons-material/CloudRounded";
import MonitorHeartRoundedIcon   from "@mui/icons-material/MonitorHeartRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import api from "../../services/api";

const AUTO_REFRESH_MS = 30_000;

const SERVICE_META = {
  database: { label: "Database",         icon: <StorageRoundedIcon /> },
  email:    { label: "Email Service",    icon: <EmailRoundedIcon /> },
  payment:  { label: "Payment Gateway",  icon: <PaymentsRoundedIcon /> },
  maps:     { label: "Google Maps API",  icon: <MapRoundedIcon /> },
};

function StatusIndicator({ status }) {
  if (status === "ok") {
    return <CheckCircleRoundedIcon sx={{ color: "#2E7D32", fontSize: 28 }} />;
  }
  if (status === "error") {
    return <ErrorRoundedIcon sx={{ color: "#C62828", fontSize: 28 }} />;
  }
  if (status === "not_configured") {
    return <HelpOutlineRoundedIcon sx={{ color: "#F57C00", fontSize: 28 }} />;
  }
  // degraded or unknown
  return <HelpOutlineRoundedIcon sx={{ color: "#F9A825", fontSize: 28 }} />;
}

function statusColor(status) {
  if (status === "ok")             return "success";
  if (status === "error")          return "error";
  if (status === "not_configured") return "warning";
  return "default";
}

function statusLabel(status) {
  if (status === "ok")             return "Healthy";
  if (status === "error")          return "Error";
  if (status === "not_configured") return "Not Configured";
  if (status === "degraded")       return "Degraded";
  return "Unknown";
}

export default function HealthDashboard() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.request("/health/status");
      setData(result);
      setLastCheck(new Date());
    } catch (err) {
      setError(err?.message || "Failed to fetch health status");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchHealth, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const overallStatus = data?.status || "unknown";

  return (
    <AppLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 960, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MonitorHeartRoundedIcon sx={{ color: brand.orange, fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: brand.text }}>
                System Health
              </Typography>
              {lastCheck && (
                <Typography variant="caption" sx={{ color: brand.muted }}>
                  Last checked: {lastCheck.toLocaleTimeString()} — auto-refreshes every 30s
                </Typography>
              )}
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} sx={{ color: brand.orange }} /> : <RefreshRoundedIcon />}
            onClick={fetchHealth}
            disabled={loading}
            sx={{ fontWeight: 700 }}
          >
            {loading ? "Checking…" : "Refresh"}
          </Button>
        </Box>

        {/* Overall status banner */}
        {data && (
          <Card
            sx={{
              mb: 3,
              borderLeft: `4px solid ${overallStatus === "ok" ? "#2E7D32" : "#C62828"}`,
              bgcolor: overallStatus === "ok" ? "#E8F5E9" : "#FFEBEE",
            }}
          >
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CloudRoundedIcon sx={{ color: overallStatus === "ok" ? "#2E7D32" : "#C62828" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Backend API
                </Typography>
                <Chip
                  label={overallStatus === "ok" ? "All Systems Operational" : "Degraded"}
                  color={overallStatus === "ok" ? "success" : "error"}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
                {data.version && (
                  <Typography variant="caption" sx={{ color: brand.muted, ml: "auto" }}>
                    v{data.version}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {error && !loading && (
          <Card sx={{ mb: 3, borderLeft: `4px solid #C62828`, bgcolor: "#FFEBEE" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "#C62828", fontWeight: 600 }}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Service cards */}
        <Grid container spacing={2}>
          {Object.entries(SERVICE_META).map(([key, meta]) => {
            const status = data?.checks?.[key] || "unknown";
            return (
              <Grid item xs={12} sm={6} key={key}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: brand.orange }}>
                        {meta.icon}
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brand.text }}>
                          {meta.label}
                        </Typography>
                      </Box>
                      {loading && !data ? (
                        <CircularProgress size={20} sx={{ color: brand.muted }} />
                      ) : (
                        <StatusIndicator status={status} />
                      )}
                    </Box>
                    <Chip
                      label={statusLabel(status)}
                      color={statusColor(status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Raw timestamp */}
        {data?.timestamp && (
          <Typography variant="caption" sx={{ display: "block", textAlign: "right", mt: 2, color: brand.muted }}>
            Server time: {new Date(data.timestamp).toLocaleString()}
          </Typography>
        )}
      </Box>
    </AppLayout>
  );
}
