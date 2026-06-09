import { useEffect, useState } from "react";
import { Container, Box, Typography, Alert, CircularProgress } from "@mui/material";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import AppLayout          from "../../components/AppLayout";
import AvailabilityToggle from "../../components/AvailabilityToggle";
import catererService     from "../../services/catererService";
import { brand }          from "../../theme";

export default function AvailabilityPage() {
  const [status, setStatus]   = useState("READY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    catererService.getMyAvailability()
      .then((d) => setStatus(d?.availability_status || "READY"))
      .catch(() => setError("Failed to load availability."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = async (newStatus) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const d = await catererService.setMyAvailability(newStatus);
      setStatus(d.availability_status || newStatus);
      setSuccess(`Status updated to ${d.availability_status === "READY" ? "Ready For Orders" : "Not Ready"}.`);
    } catch { setError("Failed to update availability."); }
    finally { setSaving(false); }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <CircleRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Availability</Typography>
        </Box>

        {error   && <Alert severity="error"   onClose={() => setError("")}   sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <AvailabilityToggle status={status} onChange={handleChange} loading={saving} />
        )}

        <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: brand.orangeLight }}>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            <strong>READY</strong> — Customers can see your menu and place orders.<br />
            <strong>NOT READY</strong> — Your menu is visible but ordering is disabled.
            Use this when you are closed, on a break, or at capacity.
          </Typography>
        </Box>
      </Container>
    </AppLayout>
  );
}
