import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Card, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, Alert, Chip, Button,
  TextField, InputAdornment, Stack, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import TwoWheelerRoundedIcon from "@mui/icons-material/TwoWheelerRounded";
import SearchRoundedIcon     from "@mui/icons-material/SearchRounded";
import PersonAddRoundedIcon  from "@mui/icons-material/PersonAddRounded";
import StarRoundedIcon       from "@mui/icons-material/StarRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import adminService from "../../services/adminService";

export default function AdminRidersPage() {
  const [data, setData]         = useState({ riders: [], total: 0 });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "success" });
  const [addDialog, setAddDialog] = useState(false);
  const [newRider, setNewRider]   = useState({ name: "", email: "", phone: "", password: "", caterer_id: "", vehicle_type: "", vehicle_number: "" });
  const [adding, setAdding]       = useState(false);

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

  const handleAddRider = async () => {
    if (!newRider.name || !newRider.email || !newRider.password) return;
    setAdding(true);
    try {
      await adminService.createUser({ ...newRider, role: "RIDER" });
      setSnack({ open: true, message: "Rider created successfully.", severity: "success" });
      setAddDialog(false);
      setNewRider({ name: "", email: "", phone: "", password: "", caterer_id: "", vehicle_type: "", vehicle_number: "" });
      await load();
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to create rider.", severity: "error" });
    } finally {
      setAdding(false);
    }
  };

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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TwoWheelerRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Riders</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {data.total} registered rider{data.total !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained" startIcon={<PersonAddRoundedIcon />}
            onClick={() => setAddDialog(true)}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, fontWeight: 700, textTransform: "none" }}
          >
            Add Rider
          </Button>
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
                  <TableCell align="center">Rating</TableCell>
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
                    <TableCell align="center">
                      {r.avg_rating != null ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}>
                          <StarRoundedIcon sx={{ fontSize: 13, color: brand.star }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{Number(r.avg_rating).toFixed(1)}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>({r.review_count})</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                      )}
                    </TableCell>
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

      {/* Add Rider Dialog */}
      <Dialog open={addDialog} onClose={() => !adding && setAddDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Rider</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label="Full Name *" value={newRider.name} onChange={(e) => setNewRider((s) => ({ ...s, name: e.target.value }))} fullWidth />
            <TextField size="small" label="Email *" type="email" value={newRider.email} onChange={(e) => setNewRider((s) => ({ ...s, email: e.target.value }))} fullWidth />
            <TextField size="small" label="Phone" value={newRider.phone} onChange={(e) => setNewRider((s) => ({ ...s, phone: e.target.value }))} fullWidth />
            <TextField size="small" label="Caterer ID (optional)" value={newRider.caterer_id} onChange={(e) => setNewRider((s) => ({ ...s, caterer_id: e.target.value }))} fullWidth helperText="UUID of the caterer this rider belongs to" />
            <TextField size="small" label="Vehicle Type" placeholder="e.g. Bike, Scooter" value={newRider.vehicle_type} onChange={(e) => setNewRider((s) => ({ ...s, vehicle_type: e.target.value }))} fullWidth />
            <TextField size="small" label="Vehicle Number" value={newRider.vehicle_number} onChange={(e) => setNewRider((s) => ({ ...s, vehicle_number: e.target.value }))} fullWidth />
            <TextField size="small" label="Password *" type="password" value={newRider.password} onChange={(e) => setNewRider((s) => ({ ...s, password: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialog(false)} disabled={adding}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRider} disabled={adding || !newRider.name || !newRider.email || !newRider.password}
            startIcon={adding ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, fontWeight: 700 }}>
            Create
          </Button>
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
