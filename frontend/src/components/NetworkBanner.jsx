import { Collapse, Alert } from "@mui/material";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import { useNetwork } from "../contexts/NetworkContext";

/**
 * NetworkBanner — small sticky amber strip shown when user goes offline mid-session.
 * Auto-hides when connectivity is restored.
 */
export default function NetworkBanner() {
  let isOnline = true;
  let wasOnlineBefore = false;

  // Graceful degradation if NetworkContext is not yet mounted
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useNetwork();
    isOnline = ctx.isOnline;
    // Show banner only when user was previously online and is now offline
    wasOnlineBefore = ctx.lastOnlineAt !== null;
  } catch {
    return null;
  }

  const show = !isOnline && wasOnlineBefore;

  return (
    <Collapse in={show} unmountOnExit>
      <Alert
        icon={<WifiOffRoundedIcon fontSize="small" />}
        severity="warning"
        variant="filled"
        sx={{
          borderRadius: 0,
          py: 0.5,
          px: 2,
          fontSize: "0.82rem",
          fontWeight: 600,
          "& .MuiAlert-icon": { alignItems: "center" },
        }}
      >
        You're offline — showing cached data
      </Alert>
    </Collapse>
  );
}
