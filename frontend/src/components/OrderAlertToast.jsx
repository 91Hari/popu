import { useEffect } from "react";
import { Box, Card, CardContent, IconButton, Typography, Button, Slide } from "@mui/material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import WarningAmberRoundedIcon        from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon               from "@mui/icons-material/CloseRounded";
import { useNavigate } from "react-router-dom";
import { brand } from "../theme";

function AlertCard({ alert, onDismiss }) {
  const navigate = useNavigate();
  const isReminder = alert.notification_type === "ORDER_REMINDER";

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(alert.id), 8000);
    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);

  const handleViewOrder = () => {
    navigate("/caterer/sub-orders");
    onDismiss(alert.id);
  };

  return (
    <Slide direction="left" in mountOnEnter unmountOnExit>
      <Card
        elevation={6}
        sx={{
          mb: 1.5,
          minWidth: 300,
          maxWidth: 360,
          borderRadius: 2.5,
          border: `2px solid ${isReminder ? "#F9A825" : brand.orange}`,
          backgroundColor: isReminder ? "#FFF8E1" : brand.white,
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        <CardContent sx={{ pb: "12px !important", pt: 1.5, px: 2 }}>
          {/* Close button */}
          <IconButton
            size="small"
            onClick={() => onDismiss(alert.id)}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              color: brand.muted,
              "&:hover": { color: brand.text },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>

          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75, pr: 3 }}>
            {isReminder ? (
              <WarningAmberRoundedIcon sx={{ color: "#F9A825", fontSize: 22 }} />
            ) : (
              <NotificationsActiveRoundedIcon sx={{ color: brand.orange, fontSize: 22 }} />
            )}
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: brand.text, lineHeight: 1.3 }}
            >
              {alert.title}
            </Typography>
          </Box>

          {/* Message */}
          <Typography
            variant="caption"
            sx={{ color: brand.muted, display: "block", mb: 1.25, lineHeight: 1.5 }}
          >
            {alert.message}
          </Typography>

          {/* Action button */}
          <Button
            size="small"
            variant="contained"
            onClick={handleViewOrder}
            sx={{
              backgroundColor: isReminder ? "#F9A825" : brand.orange,
              color: isReminder ? brand.text : "#ffffff",
              fontWeight: 700,
              fontSize: "0.75rem",
              px: 2,
              py: 0.5,
              borderRadius: 1.5,
              textTransform: "none",
              "&:hover": {
                backgroundColor: isReminder ? "#F57F17" : brand.orangeMid,
              },
            }}
          >
            View Order
          </Button>
        </CardContent>
      </Card>
    </Slide>
  );
}

/**
 * OrderAlertToast
 *
 * Props:
 *   alerts    {Array}    — array of notification objects
 *   onDismiss {Function} — called with notification id to remove an alert
 */
export default function OrderAlertToast({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse", // newest on top
      }}
    >
      {[...alerts].reverse().map((alert) => (
        <AlertCard key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </Box>
  );
}
