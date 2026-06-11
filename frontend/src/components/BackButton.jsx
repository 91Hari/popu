import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { brand } from "../theme";

export default function BackButton({ sx = {} }) {
  const navigate = useNavigate();
  return (
    <Button
      size="small"
      startIcon={<ArrowBackRoundedIcon />}
      onClick={() => navigate(-1)}
      sx={{
        color: brand.muted,
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.85rem",
        px: 1,
        "&:hover": { color: brand.orange, backgroundColor: brand.orangeLight },
        ...sx,
      }}
    >
      Back
    </Button>
  );
}
