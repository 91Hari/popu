import { useState } from "react";
import { Box, Typography } from "@mui/material";
import StarRoundedIcon     from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarHalfRoundedIcon  from "@mui/icons-material/StarHalfRounded";
import { brand } from "../theme";

// Display-only stars (supports half-stars)
export function StarDisplay({ rating, count, size = 16, showCount = true }) {
  if (rating == null) {
    return (
      <Typography variant="caption" sx={{ color: "text.disabled" }}>No reviews yet</Typography>
    );
  }
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<StarRoundedIcon key={i} sx={{ fontSize: size, color: brand.star }} />);
    } else if (rating >= i - 0.5) {
      stars.push(<StarHalfRoundedIcon key={i} sx={{ fontSize: size, color: brand.star }} />);
    } else {
      stars.push(<StarBorderRoundedIcon key={i} sx={{ fontSize: size, color: brand.star }} />);
    }
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
      {stars}
      {showCount && (
        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700, color: brand.text }}>
          {Number(rating).toFixed(1)}
          {count != null && (
            <Typography component="span" variant="caption" sx={{ color: "text.secondary", fontWeight: 400 }}>
              {" "}({count})
            </Typography>
          )}
        </Typography>
      )}
    </Box>
  );
}

// Interactive star picker
export function StarPicker({ value, onChange, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          sx={{ cursor: "pointer", lineHeight: 0 }}
        >
          {display >= star
            ? <StarRoundedIcon sx={{ fontSize: size, color: brand.star }} />
            : <StarBorderRoundedIcon sx={{ fontSize: size, color: brand.star, opacity: 0.5 }} />}
        </Box>
      ))}
    </Box>
  );
}

