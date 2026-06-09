import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, Chip, Button, Stack, CircularProgress,
  Card,
} from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import FiberNewRoundedIcon          from "@mui/icons-material/FiberNewRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AppLayout                    from "../../components/AppLayout";
import catererNotifService          from "../../services/catererNotificationService";
import { useNotifications }         from "../../contexts/NotificationContext";
import { brand }                    from "../../theme";

export default function CatererNotificationsPage() {
  const navigate         = useNavigate();
  const { refresh }      = useNotifications();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const data = await catererNotifService.getNotifications();
      setNotifs(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleClick = async (notif) => {
    try { await catererNotifService.markRead(notif.id); } catch { /* ignore */ }
    refresh();
    setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
    const dest = notif.reference_id
      ? `/caterer/orders?highlight=${notif.reference_id}`
      : "/caterer/orders";
    navigate(dest);
  };

  const handleMarkAll = async () => {
    try { await catererNotifService.markAllRead(); } catch { /* ignore */ }
    refresh();
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <NotificationsNoneRoundedIcon sx={{ color: brand.orange, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Notifications</Typography>
          </Stack>
          {notifs.some((n) => !n.is_read) && (
            <Button size="small" variant="outlined" onClick={handleMarkAll}
              sx={{ borderColor: brand.orange, color: brand.orange, fontWeight: 600, textTransform: "none" }}>
              Mark all read
            </Button>
          )}
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : notifs.length === 0 ? (
          <Card elevation={0} sx={{ p: 4, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>All caught up!</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>No notifications yet.</Typography>
          </Card>
        ) : (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <List disablePadding>
              {notifs.map((n, idx) => (
                <Box key={n.id}>
                  <ListItemButton
                    onClick={() => handleClick(n)}
                    sx={{
                      px: 2, py: 1.5,
                      backgroundColor: n.is_read ? "transparent" : "#FFF8F3",
                      "&:hover": { backgroundColor: brand.orangeLight },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FiberNewRoundedIcon
                        sx={{ color: n.is_read ? "text.disabled" : brand.orange, fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" sx={{ fontWeight: n.is_read ? 400 : 700 }}>
                            {n.title}
                          </Typography>
                          {!n.is_read && (
                            <Chip label="NEW" size="small"
                              sx={{ height: 16, fontSize: "0.62rem", fontWeight: 700,
                                backgroundColor: brand.orange, color: "#fff", borderRadius: 1 }} />
                          )}
                        </Stack>
                      }
                      secondary={n.message}
                    />
                    <Typography variant="caption" sx={{ color: "text.disabled", ml: 1, whiteSpace: "nowrap" }}>
                      {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </Typography>
                  </ListItemButton>
                  {idx < notifs.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Card>
        )}
      </Container>
    </AppLayout>
  );
}
