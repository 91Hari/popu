import { useNavigate } from "react-router-dom";
import { Box, Container, Toolbar, Typography, Button, IconButton, Stack } from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { brand } from "../../theme";
import TopNav from "../../components/TopNav";

export default function TrainingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

      <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 4 }}>
          <IconButton size="small" onClick={() => navigate("/services")} sx={{ color: brand.muted }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Training Academy</Typography>
        </Stack>

        <Box sx={{ textAlign: "center", py: 6 }}>
          <Box
            sx={{
              width: 100, height: 100, borderRadius: "50%",
              backgroundColor: brand.border,
              display: "flex", alignItems: "center", justifyContent: "center",
              mx: "auto", mb: 3,
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 48, color: brand.muted }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Coming Soon</Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 3, lineHeight: 1.7 }}>
            Culinary training, upskilling courses, and<br />
            professional certification programs.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate("/services")}
            sx={{ borderColor: brand.orange, color: brand.orange }}
          >
            Back to Services
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
