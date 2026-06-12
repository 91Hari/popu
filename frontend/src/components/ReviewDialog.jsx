import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress, Stack,
} from "@mui/material";
import StarRoundedIcon      from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import { brand } from "../theme";
import reviewService from "../services/reviewService";

const LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent" };

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <Box sx={{ display: "flex", gap: 0.75 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          sx={{ cursor: "pointer", lineHeight: 0 }}
        >
          {display >= star
            ? <StarRoundedIcon      sx={{ fontSize: 36, color: brand.star }} />
            : <StarBorderRoundedIcon sx={{ fontSize: 36, color: brand.star, opacity: 0.4 }} />}
        </Box>
      ))}
    </Box>
  );
}

/**
 * ReviewDialog — reusable dialog for submitting a review.
 *
 * Props:
 *   open          boolean
 *   onClose       fn()
 *   onDone        fn(review)  — called after successful submit
 *   subjectType   'food' | 'caterer' | 'rider' | 'catering_service'
 *   subjectId     UUID
 *   subjectName   string  — display label e.g. "Rasam" or "k.v.r. Lakshmi"
 *   orderRefId    UUID (optional)
 */
export default function ReviewDialog({ open, onClose, onDone, subjectType, subjectId, subjectName, orderRefId }) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  // Pre-load existing review when dialog opens
  useEffect(() => {
    if (!open || !subjectId) return;
    setRating(0); setComment(""); setError("");
    reviewService.getMyReview(subjectType, subjectId).then((r) => {
      if (r) { setRating(r.rating); setComment(r.comment || ""); }
    }).catch(() => {});
  }, [open, subjectId, subjectType]);

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a rating."); return; }
    setSaving(true); setError("");
    try {
      const review = await reviewService.submitReview({
        subject_type: subjectType,
        subject_id:   subjectId,
        order_ref_id: orderRefId,
        rating,
        comment,
      });
      onDone?.(review);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = { food: "Food", caterer: "Caterer", rider: "Rider", catering_service: "Catering Service" }[subjectType] || "";

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
        Rate {typeLabel}
        {subjectName && (
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 400, mt: 0.25 }}>
            {subjectName}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: "16px !important" }}>
        <Stack spacing={2}>
          <Box>
            <StarPicker value={rating} onChange={(v) => { setRating(v); setError(""); }} />
            {rating > 0 && (
              <Typography variant="caption" sx={{ color: brand.star, fontWeight: 700, mt: 0.5, display: "block" }}>
                {LABELS[rating]}
              </Typography>
            )}
          </Box>

          <TextField
            multiline rows={3} fullWidth size="small"
            label="Comment (optional)"
            placeholder="Share your experience…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={saving}
          />

          {error && (
            <Typography variant="caption" sx={{ color: "error.main" }}>{error}</Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained" onClick={handleSubmit}
          disabled={saving || !rating}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})` }}
        >
          {saving ? "Saving…" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
