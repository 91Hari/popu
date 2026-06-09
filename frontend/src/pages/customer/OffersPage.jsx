import { Box, Container, Toolbar, Typography } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";

const OFFERS = [
  {
    title: "₹300 OFF",
    detail: "On orders above ₹2000",
    code: "POPU300",
    valid: "Valid till 31 May 2024",
  },
  {
    title: "10% OFF",
    detail: "On Catering Bookings",
    code: "CATERER10",
    valid: "Valid till 30 Jun 2024",
  },
];

export default function OffersPage() {
  return (
    <AppLayout>

      <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          My Wallet
        </Typography>

        {/* Balance card */}
        <Box
          sx={{
            backgroundImage: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`,
            color: "white",
            borderRadius: 4,
            p: 3,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Total Balance
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              ₹2,450
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, opacity: 0.85, cursor: "pointer" }}>
              <Typography variant="caption">Transaction History</Typography>
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          <AccountBalanceWalletRoundedIcon sx={{ fontSize: 56, opacity: 0.3 }} />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Available Offers
          </Typography>
          <Typography variant="caption" sx={{ color: brand.orange, cursor: "pointer" }}>
            View All
          </Typography>
        </Box>

        {OFFERS.map((offer) => (
          <Box
            key={offer.code}
            sx={{
              backgroundColor: brand.orangeLight,
              border: `1.5px dashed ${brand.orange}`,
              borderRadius: 2.5,
              p: 2,
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: brand.orange }}>
              {offer.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {offer.detail}
            </Typography>
            <Box
              sx={{
                display: "inline-block",
                mt: 0.75,
                px: 1.25,
                py: 0.35,
                borderRadius: 1,
                backgroundColor: brand.white,
                fontFamily: "monospace",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: brand.orange,
                letterSpacing: "0.05em",
                border: `1px solid ${brand.border}`,
              }}
            >
              {offer.code}
            </Box>
            <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 0.5 }}>
              {offer.valid}
            </Typography>
          </Box>
        ))}
      </Container>
    </AppLayout>
  );
}
