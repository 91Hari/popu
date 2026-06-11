import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Card, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, Alert, Chip, Button,
  TextField, InputAdornment, Stack, Snackbar,
} from "@mui/material";
import TwoWheelerRoundedIcon from "@mui/icons-material/TwoWheelerRounded";
import SearchRoundedIcon     from "@mui/icons-material/SearchRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import adminService from "../../services/adminService";

export default function AdminRidersPage() {
  const [data, setData]         = useState({ riders: [], total: 0 });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "success" });

  const load = useCallback(async (q = search) => {
    setLoading(true);
    try {
      const result = await adminService.getAllRiders({ search: q, limit: 50 });
      setData(result);
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to load riders.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async (rider) => {
    try {
      await adminService.setCustomerStatus(rider.id, !rider.is_active);
      setSnack({ open: true, message: `${rider.name} ${!rider.is_active ? "activated" : "deactivated"}.`, severity: "success" });
      await load();
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to update status.", severity: "error" });
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <TwoWheelerRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Riders</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {data.total} registered rider{data.total !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search riders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(search)}
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            sx={{ ml: 1, textTransform: "none", fontWeight: 700, color: brand.orange }}
            onClick={() => load(search)}
          >
            Search
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : data.riders.length === 0 ? (
          <Alert severity="info">No riders found.</Alert>
        ) : (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.8rem" } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Caterer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.riders.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{r.email}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{r.phone || "—"}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      {r.vehicle_type || "—"} {r.vehicle_number ? `· ${r.vehicle_number}` : ""}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{r.caterer_name || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.is_active ? "Active" : "Inactive"}
                        size="small"
                        color={r.is_active ? "success" : "default"}
                        sx={{ fontSize: "0.65rem", fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small" variant="outlined"
                        color={r.is_active ? "error" : "primary"}
                        onClick={() => handleToggleStatus(r)}
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      >
                        {r.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Container>

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
