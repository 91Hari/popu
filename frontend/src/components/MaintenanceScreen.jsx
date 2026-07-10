import { useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import { brand } from "../theme";

const COUNTDOWN_SECONDS = 60;

/**
 * MaintenanceScreen — full-screen maintenance mode page.
 * Auto-refreshes after a 60-second countdown.
 */
export default function MaintenanceScreen() {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [checking, setChecking] = useState(false);

  const doRefresh = useCallback(() => {
    setChecking(true);
    window.location.reload();
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      doRefresh();
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, doRefresh]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 4,
        textAlign: "center",
        bgcolor: brand.bg,
      }}
    >
      <BuildRoundedIcon sx={{ fontSize: 80, color: brand.orange, mb: 3, opacity: 0.85 }} />

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: brand.text }}>
        We're Upgrading PO.PU
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: brand.muted, mb: 4, maxWidth: 320 }}
      >
        We'll be back shortly. Thank you for your patience.
      </Typography>

      {checking ? (
        <CircularProgress sx={{ color: brand.orange, mb: 2 }} />
      ) : (
        <>
          <Typography variant="body2" sx={{ color: brand.muted, mb: 2 }}>
            Retrying in <strong>{seconds}s</strong>…
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={doRefresh}
            sx={{ fontWeight: 700, px: 5 }}
          >
            Retry Now
          </Button>
        </>
      )}
    </Box>
  );
}
