import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Typography,
} from "@mui/material";
import { brand } from "../theme";

export default function LogoutConfirmationDialog({ open, onCancel, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{ sx: { borderRadius: 3, maxWidth: 380, mx: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Confirm Logout</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "text.primary", mb: 1 }}>
          Are you sure you want to logout?
        </DialogContentText>
        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
          Thank you for visiting PO.PU.<br />
          Eat Healthy. Stay Healthy.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            textTransform: "none", fontWeight: 600, borderRadius: 2,
            borderColor: brand.border, color: "text.secondary",
            "&:hover": { borderColor: brand.muted, backgroundColor: "transparent" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            textTransform: "none", fontWeight: 600, borderRadius: 2,
            backgroundColor: brand.orange,
            "&:hover": { backgroundColor: brand.orangeMid },
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
