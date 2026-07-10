import { Box, Container, Grid, Typography, Link, Divider, Stack } from "@mui/material";
import InstagramIcon  from "@mui/icons-material/Instagram";
import FacebookIcon   from "@mui/icons-material/Facebook";
import YouTubeIcon    from "@mui/icons-material/YouTube";
import LinkedInIcon   from "@mui/icons-material/LinkedIn";
import { brand } from "../theme";

const BG      = "#1B5E20";
const GOLD    = "#F4B400";
const TEXT    = "rgba(255,255,255,0.85)";
const MUTED   = "rgba(255,255,255,0.55)";
const HEADING = "#FFFFFF";

function FooterHeading({ children }) {
  return (
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 800, color: HEADING, mb: 1.5, letterSpacing: "0.03em", textTransform: "uppercase", fontSize: "0.75rem" }}
    >
      {children}
    </Typography>
  );
}

function FooterLink({ href = "#", children }) {
  return (
    <Link
      href={href}
      underline="none"
      sx={{
        display: "block", color: TEXT, fontSize: "0.85rem", mb: 0.75,
        "&:hover": { color: GOLD },
        transition: "color 0.15s",
      }}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <Box component="footer" sx={{ backgroundColor: BG, mt: "auto" }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 6 }, pb: 3 }}>
        <Grid container spacing={{ xs: 4, md: 5 }}>

          {/* Company */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FooterHeading>Company</FooterHeading>
            <FooterLink>About Us</FooterLink>
            <FooterLink>Our Services</FooterLink>
            <FooterLink>Careers</FooterLink>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FooterHeading>Contact Us</FooterHeading>
            <FooterLink href="mailto:support@popu.co.in">support@popu.co.in</FooterLink>
            <FooterLink href="mailto:contact@popu.co.in">contact@popu.co.in</FooterLink>
            <FooterLink href="tel:+918008008000">+91 800 800 8000</FooterLink>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FooterHeading>Legal</FooterHeading>
            <FooterLink>Terms &amp; Conditions</FooterLink>
            <FooterLink>Privacy Policy</FooterLink>
            <FooterLink>Refund Policy</FooterLink>
            <FooterLink>Cookie Policy</FooterLink>
          </Grid>

          {/* Locations */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FooterHeading>Locations</FooterHeading>
            <FooterLink>Hyderabad</FooterLink>
            <FooterLink>Bangalore</FooterLink>
            <FooterLink>Chennai</FooterLink>
            <FooterLink>Mumbai</FooterLink>
          </Grid>

          {/* Follow Us */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FooterHeading>Follow Us</FooterHeading>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              {[
                { icon: <InstagramIcon sx={{ fontSize: 22 }} />, label: "Instagram" },
                { icon: <FacebookIcon  sx={{ fontSize: 22 }} />, label: "Facebook"  },
                { icon: <YouTubeIcon   sx={{ fontSize: 22 }} />, label: "YouTube"   },
                { icon: <LinkedInIcon  sx={{ fontSize: 22 }} />, label: "LinkedIn"  },
              ].map(({ icon, label }) => (
                <Box
                  key={label}
                  component="a"
                  href="#"
                  aria-label={label}
                  sx={{
                    color: TEXT, display: "flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.25)",
                    "&:hover": { color: GOLD, borderColor: GOLD },
                    transition: "color 0.15s, border-color 0.15s",
                  }}
                >
                  {icon}
                </Box>
              ))}
            </Stack>
            <Typography variant="caption" sx={{ color: MUTED, fontSize: "0.78rem" }}>
              Stay connected for food updates &amp; offers.
            </Typography>
          </Grid>

        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.15)" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", sm: "center" },
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: MUTED, fontSize: "0.82rem" }}>
            © 2026 PO.PU. All Rights Reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: MUTED, fontSize: "0.78rem" }}>
            Made with ❤ for food lovers across India.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
