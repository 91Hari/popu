import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Switch, FormControlLabel,
} from "@mui/material";
import TwoWheelerRoundedIcon   from "@mui/icons-material/TwoWheelerRounded";
import SearchRoundedIcon       from "@mui/icons-material/SearchRounded";
import AccessTimeRoundedIcon   from "@mui/icons-material/AccessTimeRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import riderService from "../../services/riderService";

const BATCH_STATUS_CFG = {
  ASSIGNED:   { label: "Ready to Start", color: "#1565C0", bg: "#E3F2FD" },
  PICKING_UP: { label: "Picking Up",     color: "#E07B0A", bg: "#FFF3E0" },
  DELIVERING: { label: "Delivering",     color: "#2E7D32", bg: "#E8F5E9" },
};

export default function RiderDashboard() {
  const navigate = useNavigate();
  const [batch,    setBatch]   = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState("");
  const [toggling, setToggling] = useState(false);

  const [online, setOnline] = useState(() => {
    try { return localStorage.getItem("rider_delivery_online") === "true"; } catch { return false; }
  });

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
  })();
  const firstName = (user.name || "Rider").split(" ")[0];

  const load = useCallback(async () => {
    try {
      const data = await riderService.getCurrentBatch();
      setBatch(data?.batch ?? null);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load batch.");
      setBatch(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleToggle = async (val) => {
    setToggling(true);
    try {
      await riderService.setRiderDeliveryStatus(val ? "AVAILABLE" : "OFFLINE");
      setOnline(val);
      localStorage.setItem("rider_delivery_online", String(val));
      if (val) await load();
    } catch (err) {
      setError(err?.message || "Failed to update status.");
    } finally {
      setToggling(false);
    }
  };

  const cfg = batch ? (BATCH_STATUS_CFG[batch.status] ?? { label: batch.status, color: brand.orange, bg: "#FFF3E0" }) : null;
  const tasksDone = batch ? (batch.tasks ?? []).filter(t => t.batch_task_status === "DELIVERED").length : 0;

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Hey, {firstName}!</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {batch ? `${batch.task_count ?? 0} delivery task${batch.task_count !== 1 ? "s" : ""} in active batch` : "No active batch"}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={online}
                onChange={(e) => handleToggle(e.target.checked)}
                disabled={toggling}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#2E7D32" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#2E7D32" },
                }}
              />
            }
            label={
              <Typography variant="caption" fontWeight={700} sx={{ color: online ? "#2E7D32" : "text.disabled" }}>
                {toggling ? "…" : online ? "Online" : "Offline"}
              </Typography>
            }
            labelPlacement="start"
          />
        </Stack>

        {online && (
          <Box sx={{
            mb: 2, px: 2, py: 1, borderRadius: 2,
            backgroundColor: "#E8F5E9", border: "1px solid #A5D6A7",
            display: "flex", alignItems: "center", gap: 1,
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2E7D32", flexShrink: 0 }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: "#2E7D32" }}>
              You are online — batches will be assigned automatically
            </Typography>
          </Box>
        )}

        {/* Quick actions */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<SearchRoundedIcon />}
            onClick={() => navigate("/rider/lookup")}
            sx={{ fontWeight: 700, color: brand.orange, borderColor: brand.orange, textTransform: "none" }}
          >
            Look Up Order
          </Button>
        </Stack>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : batch ? (
          /* Active Batch Card */
          <Card
            elevation={0}
            onClick={() => navigate("/rider/batch")}
            sx={{
              border: `2px solid ${cfg.color}`,
              borderRadius: 3,
              cursor: "pointer",
              transition: "transform 0.15s",
              "&:hover": { transform: "translateY(-2px)", boxShadow: `0 4px 20px ${cfg.color}33` },
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: cfg.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <TwoWheelerRoundedIcon sx={{ color: cfg.color, fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Active Batch</Typography>
                    <Typography variant="subtitle1" fontWeight={800}>
                      #{batch.id.slice(0, 8).toUpperCase()}
                    </Typography>
                  </Box>
                </Stack>
                <Stack alignItems="flex-end" spacing={0.5}>
                  <Chip
                    label={cfg.label}
                    size="small"
                    sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.7rem" }}
                  />
                  {batch.eta_minutes && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary" }}>
                        {batch.eta_minutes} min ETA
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>

              {/* Task progress */}
              <Box sx={{ mb: 1.5 }}>
                {(batch.tasks ?? []).slice(0, 3).map((t, i) => (
                  <Stack key={t.task_id ?? i} direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
                    <Box sx={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      backgroundColor: t.batch_task_status === "DELIVERED" ? "#2E7D32" : t.batch_task_status === "PICKED_UP" ? "#E07B0A" : cfg.color,
                    }} />
                    <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                      {i + 1}. {t.caterer_business || t.caterer_name} → {t.customer_name}
                    </Typography>
                    {t.batch_task_status === "DELIVERED" && (
                      <Typography variant="caption" sx={{ color: "#2E7D32", fontWeight: 700 }}>✓</Typography>
                    )}
                  </Stack>
                ))}
                {(batch.tasks ?? []).length > 3 && (
                  <Typography variant="caption" sx={{ color: "text.secondary", pl: 2 }}>
                    +{batch.tasks.length - 3} more
                  </Typography>
                )}
              </Box>

              {/* Progress bar */}
              <Box sx={{ mb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {tasksDone} of {batch.tasks?.length ?? batch.task_count ?? 0} delivered
                  </Typography>
                </Stack>
                <Box sx={{ height: 4, borderRadius: 2, backgroundColor: "#E0E0E0", overflow: "hidden" }}>
                  <Box sx={{
                    height: "100%",
                    width: `${batch.tasks?.length ? (tasksDone / batch.tasks.length) * 100 : 0}%`,
                    backgroundColor: cfg.color,
                    borderRadius: 2,
                    transition: "width 0.3s",
                  }} />
                </Box>
              </Box>

              <Button
                fullWidth variant="contained" size="small"
                startIcon={<LocalShippingRoundedIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}CC)`,
                  textTransform: "none", fontWeight: 700, borderRadius: 2,
                }}
              >
                {batch.status === "ASSIGNED" ? "Start Delivery →" : "Manage Batch →"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 3 }}>
            <TwoWheelerRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 0.5 }}>No active batch</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {online
                ? "You will be automatically assigned a delivery batch."
                : "Go online to start receiving delivery batches."}
            </Typography>
          </Card>
        )}
      </Container>
    </AppLayout>
  );
}
