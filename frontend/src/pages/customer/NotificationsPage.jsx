import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, List, ListItem, ListItemText,
  ListItemIcon, Paper, Button, Chip, Stack, CircularProgress,
  Alert, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton,
} from "@mui/material";
import NotificationsRoundedIcon       from "@mui/icons-material/NotificationsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import DoneAllRoundedIcon             from "@mui/icons-material/DoneAllRounded";
import ReceiptLongRoundedIcon         from "@mui/icons-material/ReceiptLongRounded";
import AnnouncementRoundedIcon        from "@mui/icons-material/AnnouncementRounded";
import CloseRoundedIcon               from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon           from "@mui/icons-material/OpenInNewRounded";
import notificationService from "../../services/notificationService";
import { useNotifications } from "../../contexts/NotificationContext";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

// Notification types that have a corresponding order reference_id
const ORDER_NOTIFICATION_TYPES = new Set([
  "NEW_ORDER",
  "ORDER_ACCEPTED",
  "ORDER_CANCELLED",
  "ORDER_PREPARING",
  "ORDER_DELIVERED",
  "PAYMENT",
  "TIFFIN_ORDER",
  "CATERING_ORDER",
  "REFUND",
]);

function isOrderNotification(n) {
  return ORDER_NOTIFICATION_TYPES.has(n.notification_type) && !!n.reference_id;
}

function isTiffinNotification(n) {
  return n.notification_type === "TIFFIN_ORDER";
}

function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [toast, setToast]                 = useState("");
  const [modal, setModal]                 = useState(null); // { title, message, created_at }
  const { refresh: refreshCount } = useNotifications();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Mark a single notification read in local state + server
  const markReadLocal = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationService.markRead(id);
      refreshCount();
    } catch {
      // silently ignore — local state is already updated
    }
  }, [refreshCount]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllRead();
      refreshCount();
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const handleNotificationClick = useCallback(async (n) => {
    // Always mark read on click
    if (!n.is_read) {
      await markReadLocal(n.id);
    }

    if (isOrderNotification(n)) {
      // Tiffin orders → tiffin orders page
      if (isTiffinNotification(n)) {
        navigate("/customer/tiffin-orders");
        return;
      }
      // All other order notifications → My Bookings, highlighted
      navigate(`/customer/master-orders?order=${n.reference_id}`);
    } else {
      // General notification → open modal
      setModal({ title: n.title, message: n.message, created_at: n.created_at });
    }
  }, [markReadLocal, navigate]);

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
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Notifications</Typography>
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

        {error  && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
        {toast  && <Alert severity="info"    sx={{ mb: 2 }} onClose={() => setToast("")}>{toast}</Alert>}

        {notifications.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <NotificationsRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No notifications yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              When caterers add new food items, you'll see updates here.
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, overflow: "hidden" }}>
            <List disablePadding>
              {notifications.map((n, idx) => {
                const isOrder   = isOrderNotification(n);
                const Icon      = isOrder ? ReceiptLongRoundedIcon : AnnouncementRoundedIcon;
                const iconColor = n.is_read ? "text.disabled" : (isOrder ? brand.orange : "#1565C0");

                return (
                  <Box key={n.id}>
                    <ListItem
                      alignItems="flex-start"
                      onClick={() => handleNotificationClick(n)}
                      sx={{
                        py: 2, px: 2.5,
                        backgroundColor: n.is_read ? "transparent" : brand.greenLight,
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        "&:hover": {
                          backgroundColor: n.is_read ? "action.hover" : brand.border,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                        <Icon sx={{ fontSize: 20, color: iconColor }} />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="subtitle2" sx={{ fontWeight: n.is_read ? 500 : 700 }}>
                              {n.title}
                            </Typography>
                            {!n.is_read && (
                              <Chip
                                label="New"
                                size="small"
                                sx={{ height: 18, fontSize: 10, backgroundColor: brand.gold, color: brand.text }}
                              />
                            )}
                            {isOrder && (
                              <Chip
                                label="Order"
                                size="small"
                                icon={<OpenInNewRoundedIcon sx={{ fontSize: "12px !important" }} />}
                                sx={{ height: 18, fontSize: 10, backgroundColor: brand.orangeLight, color: brand.orange, "& .MuiChip-icon": { color: brand.orange } }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                              {n.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5, display: "block" }}>
                              {fmtDate(n.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {idx < notifications.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          </Paper>
        )}
      </Container>

      {/* General notification detail modal */}
      <Dialog
        open={!!modal}
        onClose={() => setModal(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}
      >
        <DialogTitle sx={{ pr: 6, fontWeight: 700, pb: 1 }}>
          {modal?.title}
          <IconButton
            aria-label="close"
            onClick={() => setModal(null)}
            size="small"
            sx={{ position: "absolute", top: 12, right: 12, color: "text.secondary" }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: "4px !important" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7, mb: 1.5 }}>
            {modal?.message || "Unable to load notification."}
          </Typography>
          {modal?.created_at && (
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              {fmtDate(modal.created_at)}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="contained"
            onClick={() => setModal(null)}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
