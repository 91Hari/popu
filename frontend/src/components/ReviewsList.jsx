import { useEffect, useState } from "react";
import { Box, Typography, Stack, Divider, CircularProgress } from "@mui/material";
import { StarDisplay } from "./StarRating";
import reviewService from "../services/reviewService";
import { brand } from "../theme";

function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * ReviewsList — fetches and displays reviews for a subject.
 * Props: subjectType, subjectId, refreshKey (increment to force reload)
 */
export default function ReviewsList({ subjectType, subjectId, refreshKey = 0 }) {
  const [data, setData]       = useState({ reviews: [], total: 0, avg_rating: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    reviewService.getReviews(subjectType, subjectId)
      .then((d) => setData(d || { reviews: [], total: 0, avg_rating: null }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjectType, subjectId, refreshKey]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={22} sx={{ color: brand.orange }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <StarDisplay rating={data.avg_rating} count={data.total} size={18} />
      </Box>

      {data.reviews.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No reviews yet. Be the first to review!
        </Typography>
      ) : (
        <Stack spacing={1.5} divider={<Divider />}>
          {data.reviews.map((r) => (
            <Box key={r.id}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.reviewer_name}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{fmtDate(r.created_at)}</Typography>
              </Box>
              <StarDisplay rating={r.rating} showCount={false} size={14} />
              {r.comment && (
                <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary", lineHeight: 1.6 }}>
                  {r.comment}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
