import { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Typography, Button, IconButton, Chip, CircularProgress,
  Alert, Snackbar, Tab, Tabs, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, TextField,
} from "@mui/material";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import CheckCircleRoundedIcon     from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon          from "@mui/icons-material/CancelRounded";
import RestoreRoundedIcon         from "@mui/icons-material/RestoreRounded";
import AutoDeleteRoundedIcon      from "@mui/icons-material/AutoDeleteRounded";
import AppLayout                  from "../../components/AppLayout";
import adminService               from "../../services/adminService";
import { brand }                  from "../../theme";
import { useNavigate }            from "react-router-dom";

const STATUS_COLOR = {
  PENDING:  "warning",
  APPROVED: "success",
  REJECTED: "error",
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function AdminAccountManagementPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // ── Closure Requests tab ─────────────────────────────────────────────────────
  const [requests, setRequests]   = useState([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqFilter, setReqFilter] = useState("PENDING");

  // ── Deleted Users tab ────────────────────────────────────────────────────────
  const [deleted, setDeleted]     = useState([]);
  const [delLoading, setDelLoading] = useState(false);

  // ── Dialogs ──────────────────────────────────────────────────────────────────
  const [rejectDlg, setRejectDlg] = useState({ open: false, id: null, notes: "" });
  const [restoreDlg, setRestoreDlg] = useState({ open: false, id: null, name: "" });
  const [anonDlg, setAnonDlg]     = useState(false);

  // ── Action loading & snack ───────────────────────────────────────────────────
  const [actionId, setActionId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });

  const loadRequests = useCallback(async () => {
    setReqLoading(true);
    try {
      const data = await adminService.getAccountRequests({ status: reqFilter || undefined });
      setRequests(data.requests || []);
    } catch {
      showSnack("Failed to load closure requests.", "error");
    } finally {
      setReqLoading(false);
    }
  }, [reqFilter]);

  const loadDeleted = useCallback(async () => {
    setDelLoading(true);
    try {
      const data = await adminService.getDeletedUsers();
      setDeleted(data.users || []);
    } catch {
      showSnack("Failed to load deleted users.", "error");
    } finally {
      setDelLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);
  useEffect(() => { if (tab === 1) loadDeleted(); }, [tab, loadDeleted]);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await adminService.approveClosure(id);
      showSnack("Closure approved and account deactivated.");
      loadRequests();
    } catch (err) {
      showSnack(err?.message || "Failed to approve.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleRejectSubmit = async () => {
    setActionId(rejectDlg.id);
    try {
      await adminService.rejectClosure(rejectDlg.id, rejectDlg.notes);
      showSnack("Closure request rejected.");
      setRejectDlg({ open: false, id: null, notes: "" });
      loadRequests();
    } catch (err) {
      showSnack(err?.message || "Failed to reject.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleRestoreSubmit = async () => {
    setActionId(restoreDlg.id);
    try {
      await adminService.restoreAccount(restoreDlg.id);
      showSnack("Account restored successfully.");
      setRestoreDlg({ open: false, id: null, name: "" });
      loadDeleted();
    } catch (err) {
      showSnack(err?.message || "Failed to restore.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleAnonymize = async () => {
    setAnonDlg(false);
    try {
      const res = await adminService.runAnonymization();
      showSnack(`Anonymization complete — ${res.anonymized} account(s) processed.`);
      if (tab === 1) loadDeleted();
    } catch (err) {
      showSnack(err?.message || "Anonymization failed.", "error");
    }
  };

  const headerCell = { fontWeight: 700, color: "text.secondary", fontSize: "0.75rem" };
  const busy = (id) => actionId === id;

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <ManageAccountsRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Account Management</Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2, borderBottom: `1px solid ${brand.border}` }}
          TabIndicatorProps={{ style: { backgroundColor: brand.orange } }}
        >
          <Tab label="Closure Requests" sx={{ fontWeight: 700, textTransform: "none", "&.Mui-selected": { color: brand.orange } }} />
          <Tab label="Deleted Users"    sx={{ fontWeight: 700, textTransform: "none", "&.Mui-selected": { color: brand.orange } }} />
        </Tabs>

        {/* ── Tab 0: Closure Requests ─────────────────────────────────────────── */}
        {tab === 0 && (
          <Box>
            {/* Filter chips */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
                <Chip
                  key={s || "ALL"}
                  label={s || "All"}
                  variant={reqFilter === s ? "filled" : "outlined"}
                  onClick={() => setReqFilter(s)}
                  sx={{
                    fontWeight: 700, fontSize: "0.75rem",
                    ...(reqFilter === s && { backgroundColor: brand.orange, color: "#fff" }),
                  }}
                />
              ))}
            </Box>

            {reqLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: brand.orange }} />
              </Box>
            ) : requests.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No closure requests found.</Alert>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: brand.greenLight }}>
                    <TableRow>
                      <TableCell sx={headerCell}>Caterer</TableCell>
                      <TableCell sx={headerCell}>Contact</TableCell>
                      <TableCell sx={headerCell}>Reason</TableCell>
                      <TableCell sx={headerCell}>Requested</TableCell>
                      <TableCell sx={headerCell}>Status</TableCell>
                      <TableCell sx={headerCell}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{r.user_name}</TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                          {r.email || r.mobile_number}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", maxWidth: 200, whiteSpace: "pre-wrap" }}>
                          {r.reason || <em style={{ color: "#9E9E9E" }}>No reason given</em>}
                          {r.review_notes && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              Admin note: {r.review_notes}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem" }}>{fmt(r.requested_at)}</TableCell>
                        <TableCell>
                          <Chip
                            label={r.status}
                            color={STATUS_COLOR[r.status] || "default"}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                          />
                        </TableCell>
                        <TableCell>
                          {r.status === "PENDING" && (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                size="small" variant="contained" color="success"
                                startIcon={busy(r.id) ? <CircularProgress size={12} color="inherit" /> : <CheckCircleRoundedIcon />}
                                disabled={!!actionId}
                                onClick={() => handleApprove(r.id)}
                                sx={{ fontWeight: 700, textTransform: "none", fontSize: "0.75rem" }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small" variant="outlined" color="error"
                                startIcon={<CancelRoundedIcon />}
                                disabled={!!actionId}
                                onClick={() => setRejectDlg({ open: true, id: r.id, notes: "" })}
                                sx={{ fontWeight: 700, textTransform: "none", fontSize: "0.75rem" }}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ── Tab 1: Deleted Users ────────────────────────────────────────────── */}
        {tab === 1 && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="outlined" color="error"
                startIcon={<AutoDeleteRoundedIcon />}
                onClick={() => setAnonDlg(true)}
                sx={{ fontWeight: 700, textTransform: "none" }}
              >
                Run Anonymization
              </Button>
            </Box>

            {delLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: brand.orange }} />
              </Box>
            ) : deleted.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No deleted accounts found.</Alert>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: brand.greenLight }}>
                    <TableRow>
                      <TableCell sx={headerCell}>Name</TableCell>
                      <TableCell sx={headerCell}>Contact</TableCell>
                      <TableCell sx={headerCell}>Role</TableCell>
                      <TableCell sx={headerCell}>Deleted</TableCell>
                      <TableCell sx={headerCell}>Anonymized</TableCell>
                      <TableCell sx={headerCell}>Reason</TableCell>
                      <TableCell sx={headerCell}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deleted.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: u.anonymized_at ? "text.disabled" : "inherit" }}>
                          {u.name}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                          {u.email || u.mobile_number || "—"}
                        </TableCell>
                        <TableCell>
                          <Chip label={u.role} size="small" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem" }}>{fmt(u.deleted_at)}</TableCell>
                        <TableCell sx={{ fontSize: "0.8rem" }}>
                          {u.anonymized_at
                            ? <Chip label="Anonymized" color="default" size="small" sx={{ fontSize: "0.7rem" }} />
                            : <Typography variant="caption" color="text.secondary">Pending (30d)</Typography>
                          }
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary", maxWidth: 160 }}>
                          {u.deletion_reason || "—"}
                        </TableCell>
                        <TableCell>
                          {!u.anonymized_at && (
                            <Button
                              size="small" variant="outlined"
                              startIcon={busy(u.id) ? <CircularProgress size={12} color="inherit" /> : <RestoreRoundedIcon />}
                              disabled={!!actionId}
                              onClick={() => setRestoreDlg({ open: true, id: u.id, name: u.name })}
                              sx={{ fontWeight: 700, textTransform: "none", fontSize: "0.75rem", borderColor: brand.orange, color: brand.orange }}
                            >
                              Restore
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Container>

      {/* Reject dialog */}
      <Dialog open={rejectDlg.open} onClose={() => setRejectDlg({ open: false, id: null, notes: "" })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reject Closure Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Provide a reason for rejection. This will be visible in the audit log.
          </DialogContentText>
          <TextField
            fullWidth multiline rows={3} label="Rejection notes (optional)"
            value={rejectDlg.notes}
            onChange={(e) => setRejectDlg((d) => ({ ...d, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setRejectDlg({ open: false, id: null, notes: "" })} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleRejectSubmit}
            disabled={!!actionId} sx={{ fontWeight: 700, textTransform: "none" }}>
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore dialog */}
      <Dialog open={restoreDlg.open} onClose={() => setRestoreDlg({ open: false, id: null, name: "" })}>
        <DialogTitle sx={{ fontWeight: 800 }}>Restore Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Restore <strong>{restoreDlg.name}</strong>? Their account will be reactivated and they will be able to log in again.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setRestoreDlg({ open: false, id: null, name: "" })} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleRestoreSubmit}
            disabled={!!actionId}
            sx={{ fontWeight: 700, textTransform: "none", backgroundColor: brand.orange, "&:hover": { backgroundColor: brand.orangeMid } }}>
            Yes, Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* Anonymization confirmation dialog */}
      <Dialog open={anonDlg} onClose={() => setAnonDlg(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Run Anonymization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently anonymize all deleted accounts where 30+ days have passed since deletion.
            Names, emails, and contact details will be replaced and <strong>cannot be recovered</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAnonDlg(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleAnonymize}
            sx={{ fontWeight: 700, textTransform: "none" }}>
            Run Anonymization
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
