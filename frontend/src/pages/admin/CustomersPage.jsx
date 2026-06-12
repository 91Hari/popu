import { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Typography, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Chip, Button, CircularProgress, Alert, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
} from "@mui/material";
import SearchRoundedIcon  from "@mui/icons-material/SearchRounded";
import PeopleRoundedIcon  from "@mui/icons-material/PeopleRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import AppLayout          from "../../components/AppLayout";
import adminService       from "../../services/adminService";
import { brand }          from "../../theme";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState({});
  const [addDialog, setAddDialog] = useState(false);
  const [newUser, setNewUser]     = useState({ name: "", email: "", phone: "", password: "" });
  const [adding, setAdding]       = useState(false);
  const [snack, setSnack]         = useState({ open: false, message: "", severity: "success" });

  const load = useCallback(async (q) => {
    setLoading(true);
    try {
      const data = await adminService.getCustomers({ search: q, limit: 50 });
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch { setError("Failed to load customers."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(""); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleAddCustomer = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    setAdding(true);
    try {
      await adminService.createUser({ ...newUser, role: "CUSTOMER" });
      setSnack({ open: true, message: "Customer created successfully.", severity: "success" });
      setAddDialog(false);
      setNewUser({ name: "", email: "", phone: "", password: "" });
      await load(search);
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to create customer.", severity: "error" });
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async (id, currentActive) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const updated = await adminService.setCustomerStatus(id, !currentActive);
      setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, is_active: updated.is_active } : c));
    } catch { setError("Failed to update status."); }
    finally { setBusy((b) => { const n = { ...b }; delete n[id]; return n; }); }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PeopleRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Customers</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>{total} total</Typography>
            </Box>
          </Box>
          <Button
            variant="contained" startIcon={<PersonAddRoundedIcon />}
            onClick={() => setAddDialog(true)}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, fontWeight: 700, textTransform: "none" }}
          >
            Add Customer
          </Button>
        </Box>

        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2, maxWidth: 400 }}>
          <TextField
            fullWidth size="small" placeholder="Search by name or email…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{c.email}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{c.phone || "—"}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                      {new Date(c.created_at).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={c.is_active ? "Active" : "Inactive"}
                        color={c.is_active ? "success" : "default"} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined"
                        color={c.is_active ? "error" : "success"}
                        disabled={!!busy[c.id]}
                        onClick={() => toggleStatus(c.id, c.is_active)}
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        {busy[c.id] ? <CircularProgress size={14} /> : (c.is_active ? "Deactivate" : "Activate")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      {/* Add Customer Dialog */}
      <Dialog open={addDialog} onClose={() => !adding && setAddDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Customer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label="Full Name *" value={newUser.name} onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))} fullWidth />
            <TextField size="small" label="Email *" type="email" value={newUser.email} onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))} fullWidth />
            <TextField size="small" label="Phone" value={newUser.phone} onChange={(e) => setNewUser((s) => ({ ...s, phone: e.target.value }))} fullWidth />
            <TextField size="small" label="Password *" type="password" value={newUser.password} onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialog(false)} disabled={adding}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCustomer} disabled={adding || !newUser.name || !newUser.email || !newUser.password}
            startIcon={adding ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, fontWeight: 700 }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
