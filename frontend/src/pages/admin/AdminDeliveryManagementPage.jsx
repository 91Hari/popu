import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Grid, Divider, IconButton, Collapse,
} from "@mui/material";
import TwoWheelerRoundedIcon    from "@mui/icons-material/TwoWheelerRounded";
import AccessTimeRoundedIcon    from "@mui/icons-material/AccessTimeRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import HourglassTopRoundedIcon  from "@mui/icons-material/HourglassTopRounded";
import CheckCircleRoundedIcon   from "@mui/icons-material/CheckCircleRounded";
import RefreshRoundedIcon       from "@mui/icons-material/RefreshRounded";
import PlayCircleRoundedIcon    from "@mui/icons-material/PlayCircleRounded";
import ExpandMoreRoundedIcon    from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon    from "@mui/icons-material/ExpandLessRounded";
import ArrowBackRoundedIcon     from "@mui/icons-material/ArrowBackRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import riderService from "../../services/riderService";

const BATCH_STATUS_CFG = {
  CREATED:    { label: "Queued",      color: "#9E9E9E", bg: "#F5F5F5" },
  ASSIGNED:   { label: "Assigned",   color: "#1565C0", bg: "#E3F2FD" },
  PICKING_UP: { label: "Picking Up", color: "#E07B0A", bg: "#FFF3E0" },
  DELIVERING: { label: "Delivering", color: "#2E7D32", bg: "#E8F5E9" },
  COMPLETED:  { label: "Completed",  color: "#757575", bg: "#F5F5F5" },
};

const RIDER_STATUS_COLOR = {
  AVAILABLE:   "#2E7D32",
  ASSIGNED:    "#1565C0",
  PICKING_UP:  "#E07B0A",
  DELIVERING:  "#6A1B9A",
  OFFLINE:     "#9E9E9E",
};

function StatCard({ icon, label, value, color = brand.orange }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid #E0E0E0", borderRadius: 2.5, flex: 1 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, textAlign: "center" }}>
        <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
        <Typography variant="h5" fontWeight={900} sx={{ color, lineHeight: 1 }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{label}</Typography>
      </CardContent>
    </Card>
  );
}

function BatchCard({ batch }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = BATCH_STATUS_CFG[batch.status] ?? { label: batch.status, color: "#757575", bg: "#F5F5F5" };

  return (
    <Card elevation={0} sx={{ border: `1px solid ${cfg.color}44`, borderRadius: 2.5 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <Box sx={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            backgroundColor: cfg.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LocalShippingRoundedIcon sx={{ color: cfg.color, fontSize: 20 }} />
          </Box>
          <Box flex={1} minWidth={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                  #{batch.id.slice(0, 8).toUpperCase()}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {batch.rider_name ?? "Unassigned"} · {batch.task_count ?? 0} tasks
                </Typography>
              </Box>
              <Stack alignItems="flex-end" spacing={0.5}>
                <Chip
                  label={cfg.label}
                  size="small"
                  sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                />
                {batch.eta_minutes && (
                  <Stack direction="row" alignItems="center" spacing={0.25}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>{batch.eta_minutes} min</Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Box>
          <IconButton size="small" onClick={() => setExpanded(e => !e)}>
            {expanded ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
          </IconButton>
        </Stack>

        <Collapse in={expanded}>
          <Divider sx={{ my: 1.25 }} />
          <Stack spacing={0.75}>
            {(batch.tasks ?? []).map((t, i) => (
              <Stack key={t.task_id ?? i} direction="row" alignItems="center" spacing={1}>
                <Box sx={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: t.task_status === "DELIVERED" ? "#2E7D32" : t.task_status === "PICKED_UP" ? "#E07B0A" : "#9E9E9E",
                }} />
                <Typography variant="caption" sx={{ flex: 1 }}>
                  Seq {t.sequence}: {t.task_status}
                </Typography>
              </Stack>
            ))}
          </Stack>
          {batch.rider_phone && (
            <Button
              component="a"
              href={`tel:${batch.rider_phone}`}
              size="small"
              variant="outlined"
              sx={{ mt: 1.25, textTransform: "none", fontSize: "0.75rem" }}
            >
              Call Rider
            </Button>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function AdminDeliveryManagementPage() {
  const navigate = useNavigate();
  const pollRef  = useRef(null);

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [triggering, setTriggering] = useState(false);
  const [trigMsg,    setTrigMsg]    = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const resp = await riderService.getAdminDeliveryStatus();
      setData(resp);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load delivery status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 30_000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const handleTrigger = async () => {
    setTriggering(true);
    setTrigMsg("");
    try {
      const resp = await riderService.triggerDeliveryBatch();
      setTrigMsg(`Created ${resp.batches_created ?? 0} batches, assigned ${resp.batches_assigned ?? 0}.`);
      await load(true);
    } catch (err) {
      setTrigMsg(err?.message || "Trigger failed.");
    } finally {
      setTriggering(false);
    }
  };

  const activeBatches = data?.active_batches ?? [];
  const poolWaiting   = data?.pool_waiting   ?? 0;
  const riderStats    = data?.rider_stats    ?? [];
  const today         = data?.today          ?? { total: 0, completed: 0 };

  const riderStatMap  = Object.fromEntries(riderStats.map(r => [r.delivery_status, parseInt(r.count, 10)]));
  const ridersOnline  = (riderStatMap.AVAILABLE ?? 0) + (riderStatMap.ASSIGNED ?? 0) + (riderStatMap.PICKING_UP ?? 0) + (riderStatMap.DELIVERING ?? 0);

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 2, pb: 5 }}>
        {/* Back + Header */}
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/admin")}
          sx={{ mb: 1.5, color: "text.secondary", textTransform: "none" }}
        >
          Admin
        </Button>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Delivery Management</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Live delivery status · auto-refreshes every 30 s
            </Typography>
          </Box>
          <IconButton onClick={() => load(true)} disabled={loading}>
            <RefreshRoundedIcon />
          </IconButton>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {trigMsg && <Alert severity="info" sx={{ mb: 2 }}>{trigMsg}</Alert>}

        {/* Stats grid */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
          <StatCard icon={<LocalShippingRoundedIcon />} label="Today's Batches" value={today.total}  color={brand.orange} />
          <StatCard icon={<CheckCircleRoundedIcon />}   label="Completed"        value={today.completed} color="#2E7D32" />
          <StatCard icon={<TwoWheelerRoundedIcon />}    label="Riders Online"    value={ridersOnline}    color="#1565C0" />
          <StatCard icon={<HourglassTopRoundedIcon />}  label="Pool Queue"       value={poolWaiting}    color={poolWaiting > 0 ? "#E07B0A" : "#9E9E9E"} />
        </Stack>

        {/* Pool alert */}
        {poolWaiting > 0 && (
          <Alert
            severity="warning"
            icon={<HourglassTopRoundedIcon />}
            sx={{ mb: 2, borderRadius: 2 }}
            action={
              <Button
                size="small" variant="contained" color="warning"
                disabled={triggering}
                startIcon={triggering ? <CircularProgress size={14} color="inherit" /> : <PlayCircleRoundedIcon />}
                onClick={handleTrigger}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Run Now
              </Button>
            }
          >
            {poolWaiting} task{poolWaiting !== 1 ? "s" : ""} waiting in pool for batching
          </Alert>
        )}

        {/* Trigger button (always visible) */}
        <Button
          variant="outlined"
          startIcon={triggering ? <CircularProgress size={16} color="inherit" /> : <PlayCircleRoundedIcon />}
          disabled={triggering}
          onClick={handleTrigger}
          sx={{ mb: 2.5, textTransform: "none", fontWeight: 700, borderColor: brand.orange, color: brand.orange }}
        >
          Trigger Pool + Assignment
        </Button>

        {/* Rider status breakdown */}
        {riderStats.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.secondary", mb: 1.25, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
              Rider Status
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {riderStats.map(r => (
                <Chip
                  key={r.delivery_status}
                  label={`${r.delivery_status}: ${r.count}`}
                  size="small"
                  sx={{
                    backgroundColor: (RIDER_STATUS_COLOR[r.delivery_status] ?? "#9E9E9E") + "1A",
                    color:           RIDER_STATUS_COLOR[r.delivery_status] ?? "#9E9E9E",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Active batches */}
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.secondary", mb: 1.25, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
          Active Batches ({activeBatches.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : activeBatches.length === 0 ? (
          <Card elevation={0} sx={{ p: 4, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 2.5 }}>
            <LocalShippingRoundedIcon sx={{ fontSize: 48, color: brand.border, mb: 1 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>No active batches</Typography>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {activeBatches.map(batch => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </Stack>
        )}
      </Container>
    </AppLayout>
  );
}
