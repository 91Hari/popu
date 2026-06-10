import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, Card, CardContent, Stack,
  Chip, Button, CircularProgress, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar,
} from "@mui/material";
import PaymentRoundedIcon        from "@mui/icons-material/PaymentRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon         from "@mui/icons-material/CancelRounded";
import RefreshRoundedIcon        from "@mui/icons-material/RefreshRounded";
import OpenInNewRoundedIcon      from "@mui/icons-material/OpenInNewRounded";
import paymentProofService from "../../services/paymentProofService";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

const STATUS_CFG = {
  PENDING_REVIEW:     { label: "Pending Review",    color: "#F57F17", bg: "#FFF8E1" },
  APPROVED:           { label: "Approved",          color: "#2E7D32", bg: "#E8F5E9" },
  REJECTED:           { label: "Rejected",          color: "#C62828", bg: "#FFEBEE" },
  REUPLOAD_REQUESTED: { label: "Re-upload Requested", color: "#E65100", bg: "#FFF3E0" },
};

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CatererPaymentReviewPage() {
  const [proofs, setProofs]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState({});
  const [rejectDialog, setRejectDialog] = useState({ open: false, proofId: null, reason: "" });
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "success" });

  const load = useCallback(async () => {
    try {
      const data = await paymentProofService.getProofsForCaterer();
      setProofs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load payment proofs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (proofId, status, rejection_reason) => {
    setSubmitting((s) => ({ ...s, [proofId]: true }));
    try {
      const updated = await paymentProofService.reviewProof(proofId, { status, rejection_reason });
      setProofs((prev) => prev.map((p) => p.id === proofId ? { ...p, ...updated } : p));
      setSnack({ open: true, message: `Proof ${status.toLowerCase().replace("_", " ")}.`, severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to update.", severity: "error" });
    } finally {
      setSubmitting((s) => { const n = { ...s }; delete n[proofId]; return n; });
    }
  };

  const handleRejectConfirm = async () => {
    await handleAction(rejectDialog.proofId, "REJECTED", rejectDialog.reason);
    setRejectDialog({ open: false, proofId: null, reason: "" });
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </AppLayout>
    );
  }

  const pending  = proofs.filter((p) => p.payment_status === "PENDING_REVIEW");
  const reviewed = proofs.filter((p) => p.payment_status !== "PENDING_REVIEW");

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <PaymentRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Payment Review</Typography>
            {pending.length > 0 && (
              <Typography variant="body2" sx={{ color: "#C62828" }}>
                {pending.length} proof{pending.length !== 1 ? "s" : ""} awaiting review
              </Typography>
            )}
          </Box>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {proofs.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <PaymentRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No payment proofs yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Customer payment proofs will appear here when submitted.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {[...pending, ...reviewed].map((proof) => {
              const cfg       = STATUS_CFG[proof.payment_status] || STATUS_CFG.PENDING_REVIEW;
              const isLoading = !!submitting[proof.id];
              const isPending = proof.payment_status === "PENDING_REVIEW";

              return (
                <Card key={proof.id} elevation={0} sx={{
                  border: `2px solid ${isPending ? "#F9A825" : brand.border}`,
                }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {proof.customer_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Sub-order #{proof.caterer_order_id?.slice(0, 8).toUpperCase()} · ₹{Number(proof.amount || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                          Uploaded: {fmtDate(proof.uploaded_at)}
                        </Typography>
                      </Box>
                      <Chip
                        label={cfg.label}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: "0.65rem", backgroundColor: cfg.bg, color: cfg.color }}
                      />
                    </Stack>

                    <Divider sx={{ mb: 1.25 }} />

                    {proof.upi_reference && (
                      <Typography variant="body2" sx={{ mb: 0.75 }}>
                        <strong>UPI Ref:</strong> {proof.upi_reference}
                      </Typography>
                    )}

                    {proof.payment_screenshot_url && (
                      <Button
                        size="small" variant="outlined"
                        endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                        href={proof.payment_screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mb: 1.25, fontWeight: 600, fontSize: "0.75rem" }}
                      >
                        View Screenshot
                      </Button>
                    )}

                    {proof.rejection_reason && (
                      <Alert severity="error" sx={{ mb: 1.25, fontSize: "0.78rem", py: 0 }}>
                        Rejection reason: {proof.rejection_reason}
                      </Alert>
                    )}

                    {isPending && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          size="small" variant="contained" color="success"
                          startIcon={isLoading ? <CircularProgress size={12} color="inherit" /> : <CheckCircleRoundedIcon fontSize="small" />}
                          disabled={isLoading}
                          onClick={() => handleAction(proof.id, "APPROVED", "")}
                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small" variant="outlined" color="error"
                          startIcon={<CancelRoundedIcon fontSize="small" />}
                          disabled={isLoading}
                          onClick={() => setRejectDialog({ open: true, proofId: proof.id, reason: "" })}
                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="small" variant="outlined"
                          startIcon={<RefreshRoundedIcon fontSize="small" />}
                          disabled={isLoading}
                          onClick={() => handleAction(proof.id, "REUPLOAD_REQUESTED", "")}
                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                        >
                          Request Re-upload
                        </Button>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog((s) => ({ ...s, open: false }))} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Payment Proof</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Tell the customer why their payment proof was rejected.
          </Typography>
          <TextField
            fullWidth size="small" label="Rejection Reason (optional)"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog((s) => ({ ...s, reason: e.target.value }))}
            multiline rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog((s) => ({ ...s, open: false }))}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm}>Reject Proof</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open} autoHideDuration={3500}
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
