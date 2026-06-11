import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Card, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, Alert, Chip, Select, MenuItem,
  FormControl, InputLabel, Stack,
} from "@mui/material";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import adminService from "../../services/adminService";

const STATUS_COLORS = {
  PENDING: "info", CONFIRMED: "success", REJECTED: "error",
  CANCELLED: "default", COMPLETED: "success",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminCateringBookingsPage() {
  const [data, setData]       = useState({ bookings: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState("");
  const [error, setError]     = useState("");

  const load = useCallback(async (s = status) => {
    setLoading(true);
    setError("");
    try {
      const result = await adminService.getCateringBookings({ status: s, limit: 50 });
      setData(result);
    } catch (err) {
      setError(err?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handleStatusFilter = (e) => {
    const val = e.target.value;
    setStatus(val);
    load(val);
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <EventRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Catering Bookings</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {data.total} total booking{data.total !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select label="Filter by Status" value={status} onChange={handleStatusFilter}>
              <MenuItem value="">All Statuses</MenuItem>
              {["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : data.bookings.length === 0 ? (
          <Alert severity="info">No catering bookings found.</Alert>
        ) : (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.8rem" } }}>
                  <TableCell>Customer</TableCell>
                  <TableCell>Caterer</TableCell>
                  <TableCell>Occasion</TableCell>
                  <TableCell>Event Date</TableCell>
                  <TableCell>Guests</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Booked On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.bookings.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{b.customer_name}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{b.caterer_name}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{b.occasion_name}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{fmtDate(b.event_date)}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{b.number_of_people}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{Number(b.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        size="small"
                        color={STATUS_COLORS[b.status] || "default"}
                        sx={{ fontSize: "0.65rem", fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{fmtDate(b.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Container>
    </AppLayout>
  );
}
