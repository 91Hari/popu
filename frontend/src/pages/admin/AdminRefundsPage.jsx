import { useEffect, useState } from "react";
import {
  Container, Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, MenuItem, Select,
  FormControl, InputLabel, Pagination,
} from "@mui/material";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

const STATUS_COLORS = {
  PENDING:    "warning",
  PROCESSING: "info",
  SUCCESS:    "success",
  FAILED:     "error",
};

const STATUSES = ["", "PENDING", "PROCESSING", "SUCCESS", "FAILED"];

export default function AdminRefundsPage() {
  const [rows,    setRows]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [status,  setStatus]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError("");
    adminService.getRefunds({ page, limit, status: status || undefined })
      .then((res) => {
        setRows(res.refunds || []);
        setTotal(res.total  || 0);
      })
      .catch(() => setError("Failed to load refunds."))
      .finally(() => setLoading(false));
  }, [page, status]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <CurrencyExchangeRoundedIcon sx={{ color: brand.orange, fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Refunds</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Refunds initiated on caterer order cancellations
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={handleStatusChange}>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s || "All"}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: brand.orangeLight }}>
                    <TableCell sx={{ fontWeight: 700 }}>Refund ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No refunds found.
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                          {r.merchant_refund_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                          {r.merchant_transaction_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.customer_name}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{r.customer_email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#C62828" }}>
                          ₹{Number(r.refund_amount).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.refund_status}
                          color={STATUS_COLORS[r.refund_status] || "default"}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: "0.65rem" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {r.refund_reason || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(r.created_at).toLocaleString("en-IN", {
                            dateStyle: "short", timeStyle: "short",
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {total > limit && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={Math.ceil(total / limit)}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </AppLayout>
  );
}
