import { useState } from "react";
import {
  Container, Box, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Alert, CircularProgress, Card, CardContent,
} from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

export default function AdminNotificationsPage() {
  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget]   = useState("ALL");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return setError("Title and message are required.");
    setSending(true);
    setError("");
    setSuccess("");
    try {
      await adminService.broadcastNotification({ title: title.trim(), message: message.trim(), target_role: target });
      setSuccess(`Notification sent to ${target === "ALL" ? "all users" : target.toLowerCase() + "s"}.`);
      setTitle(""); setMessage("");
    } catch { setError("Failed to send notification."); }
    finally { setSending(false); }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <NotificationsNoneRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Broadcast Notification</Typography>
        </Box>

        {error   && <Alert severity="error"   onClose={() => setError("")}   sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>{success}</Alert>}

        <Card elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSend}>
              <FormControl fullWidth sx={{ mb: 2 }} size="small">
                <InputLabel>Send To</InputLabel>
                <Select value={target} onChange={(e) => setTarget(e.target.value)} label="Send To">
                  <MenuItem value="ALL">All Users</MenuItem>
                  <MenuItem value="CUSTOMER">Customers Only</MenuItem>
                  <MenuItem value="CATERER">Caterers Only</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth size="small" label="Title" value={title}
                onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth multiline rows={4} label="Message" value={message}
                onChange={(e) => setMessage(e.target.value)} sx={{ mb: 2.5 }} />
              <Button fullWidth variant="contained" type="submit" size="large"
                disabled={sending} startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />}
                sx={{ fontWeight: 700 }}>
                {sending ? "Sending…" : "Send Notification"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </AppLayout>
  );
}
