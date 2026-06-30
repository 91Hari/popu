import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Chip, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Snackbar, Grid,
} from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AddRoundedIcon                  from "@mui/icons-material/AddRounded";
import AppLayout                       from "../../components/AppLayout";
import complianceService               from "../../services/complianceService";
import { brand }                       from "../../theme";

const STATUS_COLORS = { PENDING: "warning", PROCESSING: "info", COMPLETED: "success", FAILED: "error" };

function SummaryChips({ summary }) {
  if (!summary) return null;
  return (
    <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
      <Chip label={`Pending: ${summary.pending_count}`} color="warning" />
      <Chip label={`Pending Amount: ₹${Number(summary.pending_amount || 0).toLocaleString("en-IN")}`} color="warning" variant="outlined" />
      <Chip label={`Completed: ${summary.completed_count}`} color="success" />
      <Chip label={`Total Paid: ₹${Number(summary.paid_amount || 0).toLocaleString("en-IN")}`} color="success" variant="outlined" />
      <Chip label={`Total TDS: ₹${Number(summary.total_tds || 0).toLocaleString("en-IN")}`} variant="outlined" />
      <Chip label={`Total Commission: ₹${Number(summary.total_commission || 0).toLocaleString("en-IN")}`} variant="outlined" />
    </Stack>
  );
}

export default function SettlementPage() {
  const [data, setData]         = useState({ items: [], total: 0, summary: null });
  const [status, setStatus]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "success" });
  const [createDialog, setCreateDialog] = useState(false);
  const [paidDialog, setPaidDialog]     = useState({ open: false, item: null, utr: "", method: "NEFT" });
  const [creating, setCreating]         = useState(false);
  const [newSettlement, setNewSettlement] = useState({ caterer_id: "", period_from: "", period_to: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complianceService.adminListSettlements({ status, limit: 50 });
      setData(res);
    } catch (e) { setSnack({ open: true, message: e?.message || "Failed", severity: "error" }); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newSettlement.caterer_id || !newSettlement.period_from || !newSettlement.period_to) return;
    setCreating(true);
    try {
      await complianceService.adminCreateSettlement(newSettlement);
      setSnack({ open: true, message: "Settlement record created", severity: "success" });
      setCreateDialog(false);
      setNewSettlement({ caterer_id: "", period_from: "", period_to: "" });
      load();
    } catch (e) { setSnack({ open: true, message: e?.message || "Error", severity: "error" }); }
    finally { setCreating(false); }
  };

  const handleMarkPaid = async () => {
    try {
      await complianceService.adminMarkSettlementPaid(paidDialog.item.id, {
        utr_number: paidDialog.utr,
        payment_method: paidDialog.method,
      });
      setSnack({ open: true, message: "Settlement marked as paid", severity: "success" });
      setPaidDialog(d => ({ ...d, open: false }));
      load();
    } catch (e) { setSnack({ open: true, message: e?.message || "Error", severity: "error" }); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";
  const fmtAmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccountBalanceWalletRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>Settlements</Typography>
              <Typography variant="body2" color="text.secondary">{data.total} record{data.total !== 1 ? "s" : ""}</Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateDialog(true)}
              sx={{ textTransform: "none", fontWeight: 700, background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})` }}>
              New Settlement
            </Button>
          </Stack>
        </Box>

        <SummaryChips summary={data.summary} />

        {loading && <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress sx={{ color: brand.orange }} /></Box>}
        {!loading && data.items.length === 0 && <Alert severity="info">No settlement records found.</Alert>}

        {!loading && data.items.length > 0 && (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: brand.bg }}>
                  {["Caterer", "Period", "Gross", "Commission", "TDS", "Net Payout", "Status", "UTR", "Action"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "text.secondary", fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{row.caterer_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{fmt(row.period_from)} – {fmt(row.period_to)}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{fmtAmt(row.gross_amount)}</TableCell>
                    <TableCell color="error.main">{fmtAmt(row.commission_amount)}</TableCell>
                    <TableCell>{fmtAmt(row.tds_deducted)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "success.main" }}>{fmtAmt(row.net_payout)}</TableCell>
                    <TableCell>
                      <Chip label={row.status} size="small" color={STATUS_COLORS[row.status] || "default"} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>{row.utr_number || "—"}</TableCell>
                    <TableCell>
                      {row.status === "PENDING" && (
                        <Button size="small" variant="contained" color="success"
                          onClick={() => setPaidDialog({ open: true, item: row, utr: "", method: "NEFT" })}
                          sx={{ textTransform: "none", fontSize: 11 }}>
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Container>

      {/* Create Settlement Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Create Settlement</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will calculate all unsettled DELIVERED/COLLECTED orders for the caterer in the period, deduct TDS and commission, and create a settlement record.
          </Alert>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Caterer ID (UUID)" required
              value={newSettlement.caterer_id} onChange={e => setNewSettlement(s => ({ ...s, caterer_id: e.target.value }))} />
            <TextField fullWidth label="Period From" type="date" required
              slotProps={{ inputLabel: { shrink: true } }}
              value={newSettlement.period_from} onChange={e => setNewSettlement(s => ({ ...s, period_from: e.target.value }))} />
            <TextField fullWidth label="Period To" type="date" required
              slotProps={{ inputLabel: { shrink: true } }}
              value={newSettlement.period_to} onChange={e => setNewSettlement(s => ({ ...s, period_to: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}
            sx={{ textTransform: "none", fontWeight: 700, background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})` }}>
            {creating ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Paid Dialog */}
      <Dialog open={paidDialog.open} onClose={() => setPaidDialog(d => ({ ...d, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Mark Settlement as Paid</DialogTitle>
        <DialogContent>
          {paidDialog.item && (
            <Box sx={{ mb: 2, p: 1.5, background: brand.bg, borderRadius: 2 }}>
              <Typography variant="body2"><strong>Caterer:</strong> {paidDialog.item.caterer_name}</Typography>
              <Typography variant="body2"><strong>Net Payout:</strong> {fmtAmt(paidDialog.item.net_payout)}</Typography>
            </Box>
          )}
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select value={paidDialog.method} label="Payment Method" onChange={e => setPaidDialog(d => ({ ...d, method: e.target.value }))}>
                <MenuItem value="NEFT">NEFT</MenuItem>
                <MenuItem value="IMPS">IMPS</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="MANUAL">Manual</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="UTR / Reference Number" required
              value={paidDialog.utr} onChange={e => setPaidDialog(d => ({ ...d, utr: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPaidDialog(d => ({ ...d, open: false }))} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleMarkPaid} variant="contained" color="success" disabled={!paidDialog.utr.trim()}
            sx={{ textTransform: "none", fontWeight: 700 }}>
            Confirm Payment
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
