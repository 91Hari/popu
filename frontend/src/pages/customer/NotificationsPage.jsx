import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import notificationService from "../../services/notificationService";
import { useNotifications } from "../../contexts/NotificationContext";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { refresh: refreshCount } = useNotifications();

  useEffect(() => { console.log("[Diag] NotificationsPage mounted"); }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      console.log("[Diag] NotificationsPage API response:", data);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationService.markRead(id);
      refreshCount();
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllRead();
      refreshCount();
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>

      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <NotificationsActiveRoundedIcon sx={{ color: brand.orange, fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {unreadCount} unread
                </Typography>
              )}
            </Box>
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllRoundedIcon />}
              onClick={handleMarkAllRead}
              sx={{ color: brand.orange, fontWeight: 600 }}
            >
              Mark all read
            </Button>
          )}
        </Stack>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {notifications.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 2 }}
          >
            <NotificationsRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              When caterers add new food items, you'll see updates here.
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, overflow: "hidden" }}
          >
            <List disablePadding>
              {notifications.map((n, idx) => (
                <Box key={n.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      px: 2.5,
                      backgroundColor: n.is_read ? "transparent" : `${brand.orangeLight}`,
                      cursor: n.is_read ? "default" : "pointer",
                      "&:hover": { backgroundColor: n.is_read ? "action.hover" : "#fce4d0" },
                    }}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      <NotificationsRoundedIcon
                        sx={{ fontSize: 20, color: n.is_read ? "text.disabled" : brand.orange }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: n.is_read ? 500 : 700 }}>
                            {n.title}
                          </Typography>
                          {!n.is_read && (
                            <Chip label="New" size="small" sx={{ height: 18, fontSize: 10, backgroundColor: brand.orange, color: "white" }} />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                            {n.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5, display: "block" }}>
                            {n.created_at
                              ? new Date(n.created_at).toLocaleString()
                              : ""}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        )}
      </Container>
    </AppLayout>
  );
}
