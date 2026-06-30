import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Chip, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Snackbar,
} from "@mui/material";
import BadgeRoundedIcon      from "@mui/icons-material/BadgeRounded";
import CheckRoundedIcon      from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon      from "@mui/icons-material/CloseRounded";
import InfoRoundedIcon       from "@mui/icons-material/InfoRounded";
import AppLayout             from "../../components/AppLayout";
import complianceService     from "../../services/complianceService";
import { brand }             from "../../theme";

const KYC_STATUS_COLORS = {
  PENDING:   "default",
  SUBMITTED: "warning",
  APPROVED:  "success",
  REJECTED:  "error",
};

export default function KycVerificationPage() {
  const [data, setData]         = useState({ items: [], total: 0 });
  const [status, setStatus]     = useState("submitted");
  const [loading, setLoading]   = useState(true);
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "success" });
  const [dialog, setDialog]     = useState({ open: false, item: null, approved: true, reason: "" });
  const [detailOpen, setDetailOpen] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complianceService.adminListKyc({ status, limit: 50 });
      setData(res);
    } catch (e) { setSnack({ open: true, message: e?.message || "Failed to load", severity: "error" }); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const openReview = (item, approved) => setDialog({ open: true, item, approved, reason: "" });
  const closeDialog = () => setDialog(d => ({ ...d, open: false }));

  const handleReview = async () => {
    try {
      await complianceService.adminReviewKyc(dialog.item.id, {
        approved: dialog.approved,
        rejection_reason: dialog.approved ? null : dialog.reason,
      });
      setSnack({ open: true, message: dialog.approved ? "KYC approved" : "KYC rejected", severity: dialog.approved ? "success" : "warning" });
      closeDialog();
      load();
    } catch (e) { setSnack({ open: true, message: e?.message || "Error", severity: "error" }); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BadgeRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>KYC Verification</Typography>
              <Typography variant="body2" color="text.secondary">{data.total} record{data.total !== 1 ? "s" : ""}</Typography>
            </Box>
          </Box>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="pending">Pending (not submitted)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading && <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress sx={{ color: brand.orange }} /></Box>}
        {!loading && data.items.length === 0 && <Alert severity="info">No records found.</Alert>}

        {!loading && data.items.length > 0 && (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: brand.bg }}>
                  {["Caterer", "Business Type", "PAN", "GST", "Status", "Submitted", "Actions"].map(h => (
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
                      <Chip label={row.business_type || "—"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{row.pan_number || "—"}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{row.gst_number || "—"}</TableCell>
                    <TableCell>
                      <Chip label={row.kyc_status} size="small" color={KYC_STATUS_COLORS[row.kyc_status] || "default"} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{fmtDate(row.updated_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {row.pan_url && (
                          <Button size="small" variant="outlined" href={row.pan_url} target="_blank"
                            sx={{ textTransform: "none", fontSize: 11 }}>PAN Doc</Button>
                        )}
                        {row.kyc_status === "SUBMITTED" && (
                          <>
                            <Button size="small" variant="contained" color="success"
                              startIcon={<CheckRoundedIcon fontSize="small" />}
                              onClick={() => openReview(row, true)}
                              sx={{ textTransform: "none", fontSize: 11 }}>Approve</Button>
                            <Button size="small" variant="outlined" color="error"
                              startIcon={<CloseRoundedIcon fontSize="small" />}
                              onClick={() => openReview(row, false)}
                              sx={{ textTransform: "none", fontSize: 11 }}>Reject</Button>
                          </>
                        )}
                        {row.rejection_reason && (
                          <Button size="small" startIcon={<InfoRoundedIcon />} onClick={() => setDetailOpen(row)}
                            sx={{ textTransform: "none", fontSize: 11 }}>Reason</Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Container>

      {/* Review Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {dialog.approved ? "Approve KYC" : "Reject KYC"}
        </DialogTitle>
        <DialogContent>
          {dialog.item && (
            <Box sx={{ mb: 2, p: 1.5, background: brand.bg, borderRadius: 2 }}>
              <Typography variant="body2"><strong>Caterer:</strong> {dialog.item.caterer_name}</Typography>
              <Typography variant="body2"><strong>PAN:</strong> {dialog.item.pan_number || "Not provided"}</Typography>
              <Typography variant="body2"><strong>GST:</strong> {dialog.item.gst_number || "Not provided"}</Typography>
              <Typography variant="body2"><strong>Business Type:</strong> {dialog.item.business_type || "Not provided"}</Typography>
            </Box>
          )}
          {!dialog.approved && (
            <TextField fullWidth label="Rejection Reason" multiline rows={3} required
              value={dialog.reason} onChange={e => setDialog(d => ({ ...d, reason: e.target.value }))} sx={{ mt: 1 }} />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleReview} variant="contained"
            color={dialog.approved ? "success" : "error"}
            disabled={!dialog.approved && !dialog.reason.trim()}
            sx={{ textTransform: "none", fontWeight: 700 }}>
            {dialog.approved ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection detail dialog */}
      <Dialog open={!!detailOpen} onClose={() => setDetailOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Rejection Reason</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{detailOpen?.rejection_reason}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(null)} sx={{ textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
