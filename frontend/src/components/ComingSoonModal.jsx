import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, IconButton, Box } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import { brand } from "../theme";

export default function ComingSoonModal({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Coming Soon</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", pt: 3, pb: 2 }}>
        <Box
          sx={{
            width: 72, height: 72, borderRadius: "50%",
            backgroundColor: brand.orangeLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            mx: "auto", mb: 2,
          }}
        >
          <RocketLaunchRoundedIcon sx={{ fontSize: 36, color: brand.orange }} />
        </Box>
        <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
          This service is currently unavailable and will be launched soon.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: brand.orange, color: "white", fontWeight: 700, borderRadius: 2,
            "&:hover": { backgroundColor: brand.orangeMid },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
