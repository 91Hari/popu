import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Chip, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Snackbar, Grid,
} from "@mui/material";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import AppLayout               from "../../components/AppLayout";
import complianceService       from "../../services/complianceService";
import { brand }               from "../../theme";

const STATUS_COLORS = {
  OPEN:        "warning",
  IN_PROGRESS: "info",
  ESCALATED:   "error",
  RESOLVED:    "success",
  CLOSED:      "default",
};

const STATUS_OPTIONS = ["all", "OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"];

export default function GrievancesPage() {
  const [data, setData]         = useState({ items: [], total: 0, summary: null });
  const [status, setStatus]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "success" });
  const [dialog, setDialog]     = useState({ open: false, item: null, status: "", resolution: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complianceService.adminListGrievances({ status, limit: 50 });
      setData(res);
    } catch (e) { setSnack({ open: true, message: e?.message || "Failed", severity: "error" }); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const openUpdate = (item) => setDialog({ open: true, item, status: item.status, resolution: item.resolution || "" });
  const closeDialog = () => setDialog(d => ({ ...d, open: false }));

  const handleUpdate = async () => {
    try {
      await complianceService.adminUpdateGrievance(dialog.item.id, {
        status: dialog.status || undefined,
        resolution: dialog.resolution || undefined,
      });
      setSnack({ open: true, message: "Grievance updated", severity: "success" });
      closeDialog();
      load();
    } catch (e) { setSnack({ open: true, message: e?.message || "Error", severity: "error" }); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const CATEGORY_LABELS = {
    FOOD_QUALITY: "Food Quality", WRONG_ORDER: "Wrong Order",
    LATE_DELIVERY: "Late Delivery", REFUND: "Refund",
    PAYMENT: "Payment", RIDER_BEHAVIOUR: "Rider Behaviour", OTHER: "Other",
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SupportAgentRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>Grievances</Typography>
              <Typography variant="body2" color="text.secondary">{data.total} total</Typography>
            </Box>
          </Box>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => (
                <MenuItem key={s} value={s}>{s === "all" ? "All" : s.replace("_", " ")}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Summary chips */}
        {data.summary && (
          <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
            <Chip label={`Open: ${data.summary.open_count}`} color="warning" />
            <Chip label={`Escalated: ${data.summary.escalated_count}`} color="error" />
            <Chip label={`In Progress: ${data.summary.in_progress_count}`} color="info" />
            <Chip label={`Resolved this week: ${data.summary.resolved_this_week}`} color="success" />
          </Stack>
        )}

        {loading && <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress sx={{ color: brand.orange }} /></Box>}
        {!loading && data.items.length === 0 && <Alert severity="info">No grievances found.</Alert>}

        {!loading && data.items.length > 0 && (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: brand.bg }}>
                  {["Ticket", "Customer", "Category", "Order", "Submitted", "Status", "Action"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "text.secondary", fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11 }}>{row.ticket_number}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{row.user_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={CATEGORY_LABELS[row.category] || row.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                        {row.order_number || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{fmtDate(row.created_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.status} size="small" color={STATUS_COLORS[row.status] || "default"} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => openUpdate(row)}
                        sx={{ textTransform: "none", fontSize: 11 }}>
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Container>

      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Update Grievance — {dialog.item?.ticket_number}</DialogTitle>
        <DialogContent>
          {dialog.item && (
            <Box sx={{ mb: 2, p: 1.5, background: brand.bg, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>{dialog.item.user_name}</Typography>
              <Typography variant="body2" color="text.secondary">{dialog.item.description}</Typography>
            </Box>
          )}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={dialog.status} label="Status" onChange={e => setDialog(d => ({ ...d, status: e.target.value }))}>
              {["OPEN","IN_PROGRESS","ESCALATED","RESOLVED","CLOSED"].map(s => (
                <MenuItem key={s} value={s}>{s.replace("_", " ")}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Resolution / Notes" multiline rows={4}
            value={dialog.resolution} onChange={e => setDialog(d => ({ ...d, resolution: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" sx={{ textTransform: "none", fontWeight: 700,
            background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})` }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
