import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Alert, Chip, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Snackbar, Link,
} from "@mui/material";
import VerifiedRoundedIcon   from "@mui/icons-material/VerifiedRounded";
import CheckRoundedIcon      from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon      from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon  from "@mui/icons-material/OpenInNewRounded";
import AppLayout             from "../../components/AppLayout";
import complianceService     from "../../services/complianceService";
import { brand }             from "../../theme";

const STATUS_COLORS = {
  true:  { label: "Verified",  color: "success" },
  false: { label: "Pending",   color: "warning" },
};

export default function FssaiVerificationPage() {
  const [data, setData]         = useState({ items: [], total: 0 });
  const [status, setStatus]     = useState("pending");
  const [loading, setLoading]   = useState(true);
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "success" });
  const [dialog, setDialog]     = useState({ open: false, item: null, approved: true, reason: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complianceService.adminListFssai({ status, limit: 50 });
      setData(res);
    } catch (e) { setSnack({ open: true, message: e?.message || "Failed to load", severity: "error" }); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const openDialog = (item, approved) => setDialog({ open: true, item, approved, reason: "" });
  const closeDialog = () => setDialog(d => ({ ...d, open: false }));

  const handleVerify = async () => {
    try {
      await complianceService.adminVerifyFssai(dialog.item.id, {
        approved: dialog.approved,
        rejection_reason: dialog.approved ? null : dialog.reason,
      });
      setSnack({ open: true, message: dialog.approved ? "FSSAI approved" : "FSSAI rejected", severity: dialog.approved ? "success" : "warning" });
      closeDialog();
      load();
    } catch (e) { setSnack({ open: true, message: e?.message || "Error", severity: "error" }); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";
  const daysLeft = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <VerifiedRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>FSSAI Verification</Typography>
              <Typography variant="body2" color="text.secondary">{data.total} record{data.total !== 1 ? "s" : ""}</Typography>
            </Box>
          </Box>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending Review</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="expiring">Expiring ≤60 days</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
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
                  {["Caterer", "FSSAI Number", "Type", "Expiry", "Status", "Actions"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "text.secondary", fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map(row => {
                  const days = daysLeft(row.expiry_date);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{row.caterer_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.caterer_email}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 600 }}>{row.fssai_number}</TableCell>
                      <TableCell>
                        <Chip label={row.license_type || "—"} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{fmtDate(row.expiry_date)}</Typography>
                        {days !== null && days <= 60 && (
                          <Chip label={days > 0 ? `${days}d left` : "EXPIRED"} size="small"
                            color={days <= 0 ? "error" : days <= 7 ? "error" : days <= 30 ? "warning" : "default"}
                            sx={{ mt: 0.25, fontWeight: 700 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {row.rejection_reason ? (
                          <Chip label="Rejected" size="small" color="error" />
                        ) : (
                          <Chip label={row.verified ? "Verified" : "Pending"} size="small"
                            color={row.verified ? "success" : "warning"} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {row.certificate_url && (
                            <Button size="small" variant="outlined" href={row.certificate_url} target="_blank"
                              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                              sx={{ textTransform: "none", fontSize: 11 }}>
                              View
                            </Button>
                          )}
                          {!row.verified && (
                            <>
                              <Button size="small" variant="contained" color="success"
                                startIcon={<CheckRoundedIcon fontSize="small" />}
                                onClick={() => openDialog(row, true)}
                                sx={{ textTransform: "none", fontSize: 11 }}>
                                Approve
                              </Button>
                              <Button size="small" variant="outlined" color="error"
                                startIcon={<CloseRoundedIcon fontSize="small" />}
                                onClick={() => openDialog(row, false)}
                                sx={{ textTransform: "none", fontSize: 11 }}>
                                Reject
                              </Button>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </Container>

      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {dialog.approved ? "Approve FSSAI License" : "Reject FSSAI License"}
        </DialogTitle>
        <DialogContent>
          {dialog.item && (
            <Box sx={{ mb: 2, p: 1.5, background: brand.bg, borderRadius: 2 }}>
              <Typography variant="body2"><strong>Caterer:</strong> {dialog.item.caterer_name}</Typography>
              <Typography variant="body2"><strong>FSSAI No:</strong> {dialog.item.fssai_number}</Typography>
              <Typography variant="body2"><strong>Expires:</strong> {fmtDate(dialog.item.expiry_date)}</Typography>
            </Box>
          )}
          {!dialog.approved && (
            <TextField
              fullWidth label="Rejection Reason" multiline rows={3} required
              value={dialog.reason} onChange={e => setDialog(d => ({ ...d, reason: e.target.value }))}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleVerify} variant="contained"
            color={dialog.approved ? "success" : "error"}
            disabled={!dialog.approved && !dialog.reason.trim()}
            sx={{ textTransform: "none", fontWeight: 700 }}>
            {dialog.approved ? "Approve" : "Reject"}
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
