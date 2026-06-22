import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Divider, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import TwoWheelerRoundedIcon    from "@mui/icons-material/TwoWheelerRounded";
import StorefrontRoundedIcon    from "@mui/icons-material/StorefrontRounded";
import HomeRoundedIcon          from "@mui/icons-material/HomeRounded";
import AccessTimeRoundedIcon    from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon   from "@mui/icons-material/CheckCircleRounded";
import ArrowBackRoundedIcon     from "@mui/icons-material/ArrowBackRounded";
import PlayArrowRoundedIcon     from "@mui/icons-material/PlayArrowRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import riderService from "../../services/riderService";

const BATCH_STATUS_CFG = {
  ASSIGNED:   { label: "Ready to Start", color: "#1565C0", bg: "#E3F2FD" },
  PICKING_UP: { label: "Picking Up",     color: "#E07B0A", bg: "#FFF3E0" },
  DELIVERING: { label: "Out for Delivery", color: "#2E7D32", bg: "#E8F5E9" },
  COMPLETED:  { label: "Completed",      color: "#757575", bg: "#F5F5F5" },
};

const TASK_STATUS_COLOR = {
  PENDING:   "#1565C0",
  PICKED_UP: "#E07B0A",
  DELIVERED: "#2E7D32",
};

export default function RiderActiveBatchPage() {
  const navigate = useNavigate();
  const pollRef  = useRef(null);

  const [batch,    setBatch]   = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState("");
  const [actioning, setActioning] = useState(null); // task_id being acted on

  const [deliverDialog, setDeliverDialog] = useState(null); // { task }
  const [code,    setCode]    = useState("");
  const [codeErr, setCodeErr] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await riderService.getCurrentBatch();
      setBatch(data?.batch ?? null);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load batch.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 15_000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const handleStart = async () => {
    if (!batch) return;
    setActioning("start");
    try {
      await riderService.startBatch(batch.id);
      await load(true);
    } catch (err) {
      setError(err?.message || "Failed to start batch.");
    } finally {
      setActioning(null);
    }
  };

  const handlePickup = async (task) => {
    setActioning(task.task_id);
    try {
      await riderService.markTaskPickedUp(batch.id, task.task_id);
      await load(true);
    } catch (err) {
      setError(err?.message || "Failed to mark pickup.");
    } finally {
      setActioning(null);
    }
  };

  const handleDeliverOpen = (task) => {
    setCode("");
    setCodeErr("");
    setDeliverDialog(task);
  };

  const handleDeliverConfirm = async () => {
    if (!code.trim()) { setCodeErr("Enter the delivery code"); return; }
    setActioning(deliverDialog.task_id);
    try {
      await riderService.confirmTaskDelivered(batch.id, deliverDialog.task_id, code.trim());
      setDeliverDialog(null);
      await load(true);
    } catch (err) {
      setCodeErr(err?.message || "Invalid code. Try again.");
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </AppLayout>
    );
  }

  if (!batch) {
    return (
      <AppLayout>
        <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/rider")} sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}>
            Back to Dashboard
          </Button>
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 3 }}>
            <TwoWheelerRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No active batch</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>You have no batch in progress.</Typography>
          </Card>
        </Container>
      </AppLayout>
    );
  }

  const cfg = BATCH_STATUS_CFG[batch.status] ?? { label: batch.status, color: brand.orange, bg: "#FFF3E0" };
  const tasks = batch.tasks ?? [];
  const tasksDone = tasks.filter(t => t.batch_task_status === "DELIVERED").length;

  // Pickups = PENDING tasks (not yet picked up)
  const pickupTasks   = tasks.filter(t => t.batch_task_status === "PENDING");
  // Drops = PICKED_UP tasks (ready to deliver)
  const deliveryTasks = tasks.filter(t => t.batch_task_status === "PICKED_UP");
  // Done
  const doneTasks     = tasks.filter(t => t.batch_task_status === "DELIVERED");

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 2, pb: 5 }}>
        {/* Back */}
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/rider")}
          sx={{ mb: 1.5, color: "text.secondary", textTransform: "none" }}
        >
          Dashboard
        </Button>

        {/* Batch header */}
        <Card elevation={0} sx={{ border: `2px solid ${cfg.color}`, borderRadius: 3, mb: 2 }}>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Batch ID</Typography>
                <Typography variant="subtitle1" fontWeight={800}>
                  #{batch.id.slice(0, 8).toUpperCase()}
                </Typography>
              </Box>
              <Stack alignItems="flex-end" spacing={0.5}>
                <Chip
                  label={cfg.label}
                  size="small"
                  sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700 }}
                />
                {batch.eta_minutes && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary" }}>
                      ~{batch.eta_minutes} min ETA
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>

            {/* Progress bar */}
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Progress: {tasksDone}/{tasks.length} delivered
                </Typography>
              </Stack>
              <Box sx={{ height: 6, borderRadius: 3, backgroundColor: "#E0E0E0", overflow: "hidden" }}>
                <Box sx={{
                  height: "100%",
                  width: `${tasks.length ? (tasksDone / tasks.length) * 100 : 0}%`,
                  backgroundColor: cfg.color,
                  borderRadius: 3,
                  transition: "width 0.3s",
                }} />
              </Box>
            </Box>

            {/* START button */}
            {batch.status === "ASSIGNED" && (
              <Button
                fullWidth variant="contained" size="large"
                startIcon={actioning === "start" ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />}
                onClick={handleStart}
                disabled={!!actioning}
                sx={{
                  mt: 2,
                  background: "linear-gradient(135deg, #1565C0, #1976D2)",
                  textTransform: "none", fontWeight: 700, borderRadius: 2, fontSize: "1rem",
                }}
              >
                Start Delivery
              </Button>
            )}
          </CardContent>
        </Card>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Pickups section */}
        {pickupTasks.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
              Pickups ({pickupTasks.length})
            </Typography>
            <Stack spacing={1.5}>
              {pickupTasks.map((task) => (
                <Card key={task.task_id} elevation={0} sx={{ border: `1px solid ${TASK_STATUS_COLOR.PENDING}44`, borderRadius: 2.5 }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      <Box sx={{
                        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: "#E3F2FD",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <StorefrontRoundedIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {task.caterer_business || task.caterer_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Seq #{task.sequence} · Pickup location
                        </Typography>
                      </Box>
                    </Stack>

                    {batch.status !== "ASSIGNED" && (
                      <Button
                        fullWidth variant="contained" size="small"
                        disabled={actioning === task.task_id}
                        startIcon={actioning === task.task_id ? <CircularProgress size={14} color="inherit" /> : null}
                        onClick={() => handlePickup(task)}
                        sx={{
                          mt: 1.5,
                          background: "linear-gradient(135deg, #1565C0, #1976D2)",
                          textTransform: "none", fontWeight: 700, borderRadius: 2,
                        }}
                      >
                        Mark Picked Up
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Deliveries section */}
        {deliveryTasks.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
              Deliver Now ({deliveryTasks.length})
            </Typography>
            <Stack spacing={1.5}>
              {deliveryTasks.map((task) => (
                <Card key={task.task_id} elevation={0} sx={{ border: `1px solid #E07B0A66`, borderRadius: 2.5, backgroundColor: "#FFFBF5" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      <Box sx={{
                        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: "#FFF3E0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <HomeRoundedIcon sx={{ color: "#E07B0A", fontSize: 20 }} />
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {task.customer_name}
                        </Typography>
                        {task.customer_phone && (
                          <Typography
                            component="a"
                            href={`tel:${task.customer_phone}`}
                            variant="caption"
                            sx={{ color: "#1565C0", textDecoration: "none" }}
                          >
                            {task.customer_phone}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                          From: {task.caterer_business || task.caterer_name}
                        </Typography>
                      </Box>
                    </Stack>

                    <Button
                      fullWidth variant="contained" size="small"
                      disabled={actioning === task.task_id}
                      onClick={() => handleDeliverOpen(task)}
                      sx={{
                        mt: 1.5,
                        background: "linear-gradient(135deg, #E07B0A, #F57C00)",
                        textTransform: "none", fontWeight: 700, borderRadius: 2,
                      }}
                    >
                      Confirm Delivery
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Done tasks */}
        {doneTasks.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
              Completed ({doneTasks.length})
            </Typography>
            <Stack spacing={1}>
              {doneTasks.map((task) => (
                <Stack key={task.task_id} direction="row" alignItems="center" spacing={1.5} sx={{ px: 1, py: 0.75, opacity: 0.6 }}>
                  <CheckCircleRoundedIcon sx={{ color: "#2E7D32", fontSize: 20, flexShrink: 0 }} />
                  <Box flex={1} minWidth={0}>
                    <Typography variant="caption" fontWeight={700} noWrap>
                      {task.caterer_business || task.caterer_name} → {task.customer_name}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {/* Delivery code dialog */}
        <Dialog
          open={!!deliverDialog}
          onClose={() => { if (!actioning) { setDeliverDialog(null); setCode(""); setCodeErr(""); } }}
          PaperProps={{ sx: { borderRadius: 3, mx: 2, width: "100%" } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delivery</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Enter the 6-digit code shown to the customer.
            </Typography>
            <TextField
              fullWidth
              label="Delivery Code"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeErr(""); }}
              error={!!codeErr}
              helperText={codeErr}
              inputProps={{ maxLength: 6, style: { textTransform: "uppercase", letterSpacing: "0.3em", fontSize: "1.3rem", textAlign: "center" } }}
              autoFocus
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => { setDeliverDialog(null); setCode(""); setCodeErr(""); }}
              disabled={!!actioning}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!!actioning}
              onClick={handleDeliverConfirm}
              sx={{
                background: "linear-gradient(135deg, #2E7D32, #388E3C)",
                textTransform: "none", fontWeight: 700,
              }}
            >
              {actioning ? <CircularProgress size={18} color="inherit" /> : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
}
