import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, Tooltip,
} from "@mui/material";
import CloseRoundedIcon        from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon  from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon        from "@mui/icons-material/CheckRounded";
import QrCodeRoundedIcon       from "@mui/icons-material/QrCodeRounded";
import { useState } from "react";
import { brand } from "../theme";

export default function QRCodeModal({ open, onClose, qrUrl, upiId, upiName, catererName, amount }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pr: 6, pb: 0.5 }}>
        Pay {catererName}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", top: 12, right: 12, color: "text.secondary" }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        {/* Amount badge */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900, color: brand.orange,
              display: "inline-block",
              px: 2, py: 0.5, borderRadius: 2,
              backgroundColor: brand.orangeLight,
              border: `1px solid ${brand.border}`,
            }}
          >
            ₹{Number(amount).toFixed(2)}
          </Typography>
        </Box>

        {/* QR code image */}
        {qrUrl ? (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              component="img"
              src={qrUrl}
              alt={`QR code for ${catererName}`}
              sx={{
                width: 240, height: 240,
                objectFit: "contain",
                border: `2px solid ${brand.border}`,
                borderRadius: 2, p: 1.5,
                backgroundColor: "#fff",
              }}
            />
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 3, mb: 2 }}>
            <QrCodeRoundedIcon sx={{ fontSize: 64, color: brand.border }} />
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              No QR code uploaded by this caterer.
            </Typography>
          </Box>
        )}

        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", textAlign: "center", mb: 2 }}>
          Scan with PhonePe, GPay, Paytm, or any UPI app
        </Typography>

        {/* UPI ID row */}
        {upiId && (
          <Box
            onClick={handleCopy}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              p: 1.5, borderRadius: 2, cursor: "pointer",
              border: `1.5px solid ${copied ? "#2e7d32" : brand.border}`,
              backgroundColor: copied ? "#f1f8f1" : brand.orangeLight,
              transition: "all 0.18s",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1 }}>
                UPI ID {upiName ? `· ${upiName}` : ""}
              </Typography>
              <Typography sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem", letterSpacing: 0.2 }}>
                {upiId}
              </Typography>
            </Box>
            <Tooltip title={copied ? "Copied!" : "Copy UPI ID"}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {copied
                  ? <CheckRoundedIcon sx={{ fontSize: 18, color: "#2e7d32" }} />
                  : <ContentCopyRoundedIcon sx={{ fontSize: 18, color: brand.orange }} />}
                <Typography variant="caption" sx={{ fontWeight: 700, color: copied ? "#2e7d32" : brand.orange }}>
                  {copied ? "Copied!" : "Copy"}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" fullWidth sx={{ fontWeight: 700, borderRadius: 1.5 }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
