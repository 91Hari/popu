import { useState } from "react";
import { Box } from "@mui/material";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import { brand } from "../theme";

/**
 * FoodImage — drop-in image component that never shows a broken image icon.
 * Props:
 *   src    {string}  — image URL
 *   alt    {string}  — alt text
 *   height {number|string} — CSS height (default 160)
 *   sx     {object}  — additional MUI sx overrides applied to the wrapper
 */
export default function FoodImage({ src, alt = "Food image", height = 160, sx = {} }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <Box
        sx={{
          width: "100%",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: brand.orangeLight,
          borderRadius: "inherit",
          ...sx,
        }}
      >
        <RestaurantRoundedIcon sx={{ fontSize: 48, color: brand.orange, opacity: 0.6 }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      sx={{
        width: "100%",
        height,
        objectFit: "cover",
        display: "block",
        borderRadius: "inherit",
        ...sx,
      }}
    />
  );
}
