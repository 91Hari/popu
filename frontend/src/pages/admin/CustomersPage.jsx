import { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Typography, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Chip, Button, CircularProgress, Alert, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  Select, MenuItem, FormControl, InputLabel, Tooltip,
} from "@mui/material";
import SearchRoundedIcon   from "@mui/icons-material/SearchRounded";
import PeopleRoundedIcon   from "@mui/icons-material/PeopleRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import LocalShippingRoundedIcon      from "@mui/icons-material/LocalShippingRounded";
import CancelOutlinedIcon            from "@mui/icons-material/CancelOutlined";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

const PRESETS = [
  { label: "All time",   value: "all" },
  { label: "Today",      value: "today" },
  { label: "This week",  value: "week" },
  { label: "This month", value: "month" },
  { label: "Custom",     value: "custom" },
];

function presetToDates(preset) {
  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  if (preset === "today")  return { date_from: fmt(today), date_to: fmt(today) };
  if (preset === "week") {
    const mon = new Date(today); mon.setDate(today.getDate() - today.getDay() + 1);
    return { date_from: fmt(mon), date_to: fmt(today) };
  }
  if (preset === "month") {
    return { date_from: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`, date_to: fmt(today) };
  }
  return {};
}

const SORT_OPTIONS = [
  { label: "Joined (newest)", value: "created_at" },
  { label: "Orders accepted", value: "orders_accepted" },
  { label: "Orders delivered", value: "orders_delivered" },
  { label: "Orders cancelled", value: "orders_cancelled" },
];

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
  const [preset, setPreset]       = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [sort, setSort]             = useState("created_at");

  const buildParams = useCallback((q = search) => {
    const params = { search: q, limit: 100, sort };
    if (preset === "custom") {
      if (customFrom) params.date_from = customFrom;
      if (customTo)   params.date_to   = customTo;
    } else {
      Object.assign(params, presetToDates(preset));
    }
    return params;
  }, [search, preset, customFrom, customTo, sort]);

  const load = useCallback(async (q = search) => {
    setLoading(true);
    try {
      const data = await adminService.getCustomers(buildParams(q));
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch { setError("Failed to load customers."); }
    finally { setLoading(false); }
  }, [buildParams, search]);

  useEffect(() => { load(); }, [load]);

  const handleAddCustomer = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    setAdding(true);
    try {
      await adminService.createUser({ ...newUser, role: "CUSTOMER" });
      setSnack({ open: true, message: "Customer created successfully.", severity: "success" });
      setAddDialog(false);
      setNewUser({ name: "", email: "", phone: "", password: "" });
      await load();
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
      <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
        {/* Header */}
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

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-end" sx={{ mb: 2, flexWrap: "wrap" }}>
          <TextField
            size="small" placeholder="Search by name or email…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(search)}
            sx={{ minWidth: 240 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment> } }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Date range</InputLabel>
            <Select label="Date range" value={preset} onChange={(e) => setPreset(e.target.value)}>
              {PRESETS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </Select>
          </FormControl>
          {preset === "custom" && (
            <>
              <TextField size="small" label="From" type="date" value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
              <TextField size="small" label="To" type="date" value={customTo}
                onChange={(e) => setCustomTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
            </>
          )}
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Sort by</InputLabel>
            <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => load(search)}
            sx={{ fontWeight: 700, color: brand.orange, borderColor: brand.orange, textTransform: "none" }}>
            Apply
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "0.8rem" } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Orders accepted by a caterer"><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}><CheckCircleOutlineRoundedIcon sx={{ fontSize: 14, color: "success.main" }} />Accepted</Box></Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Orders delivered / collected"><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}><LocalShippingRoundedIcon sx={{ fontSize: 14, color: "primary.main" }} />Delivered</Box></Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Orders cancelled"><Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4 }}><CancelOutlinedIcon sx={{ fontSize: 14, color: "error.main" }} />Cancelled</Box></Tooltip>
                  </TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{c.email}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{c.phone || "—"}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: c.orders_accepted > 0 ? "success.main" : "text.disabled" }}>
                        {c.orders_accepted ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: c.orders_delivered > 0 ? "primary.main" : "text.disabled" }}>
                        {c.orders_delivered ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: c.orders_cancelled > 0 ? "error.main" : "text.disabled" }}>
                        {c.orders_cancelled ?? 0}
                      </Typography>
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
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}>
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
