import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, CircularProgress,
  Paper, Stack, Divider,
} from "@mui/material";
import CheckCircleRoundedIcon  from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon       from "@mui/icons-material/CancelRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import ReceiptLongRoundedIcon  from "@mui/icons-material/ReceiptLongRounded";
import ShoppingBagRoundedIcon  from "@mui/icons-material/ShoppingBagRounded";
import paymentService from "../../services/paymentService";
import { useCart }    from "../../contexts/CartContext";
import AppLayout      from "../../components/AppLayout";
import { brand }      from "../../theme";

const MAX_POLLS    = 10;   // max polling attempts
const POLL_INTERVAL = 3000; // ms between polls

function SuccessView({ merchantOrderId, masterOrderId, amount, navigate }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: `2px solid ${brand.green}`,
        borderRadius: 3, p: 4, textAlign: "center",
      }}
    >
      <CheckCircleRoundedIcon sx={{ fontSize: 72, color: brand.green, mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Payment Successful!
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Your order has been placed. The caterer has been notified.
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      <Stack spacing={1} sx={{ textAlign: "left", mb: 3 }}>
        {amount !== undefined && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Amount Paid</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              ₹{Number(amount).toFixed(2)}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Transaction ID</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" }}>
            {merchantOrderId}
          </Typography>
        </Box>
        {masterOrderId && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Order ID</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              #{masterOrderId.slice(0, 8).toUpperCase()}
            </Typography>
          </Box>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<ReceiptLongRoundedIcon />}
          onClick={() => navigate("/customer/master-orders")}
          sx={{ fontWeight: 700 }}
        >
          View My Orders
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ShoppingBagRoundedIcon />}
          onClick={() => navigate("/services/food-marketplace")}
        >
          Continue Shopping
        </Button>
      </Stack>
    </Paper>
  );
}

function FailureView({ status, navigate }) {
  const isCancelled = status === "CANCELLED";
  return (
    <Paper
      elevation={0}
      sx={{
        border: "2px solid #EF5350",
        borderRadius: 3, p: 4, textAlign: "center",
      }}
    >
      <CancelRoundedIcon sx={{ fontSize: 72, color: "#EF5350", mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        {isCancelled ? "Payment Cancelled" : "Payment Failed"}
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        {isCancelled
          ? "You cancelled the payment. No amount has been deducted."
          : "Your payment could not be processed. No amount has been deducted."}
      </Typography>

      <Stack spacing={1.5}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/checkout/split")}
          sx={{ fontWeight: 700 }}
        >
          Try Again
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate("/cart")}
        >
          Back to Cart
        </Button>
      </Stack>
    </Paper>
  );
}

function PendingView() {
  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${brand.border}`,
        borderRadius: 3, p: 4, textAlign: "center",
      }}
    >
      <HourglassTopRoundedIcon sx={{ fontSize: 72, color: brand.orange, mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Payment Processing…
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        We&apos;re confirming your payment with PhonePe. This usually takes a few seconds.
      </Typography>
      <CircularProgress sx={{ color: brand.orange }} size={36} />
    </Paper>
  );
}

export default function PaymentCallbackPage() {
  const [searchParams]            = useSearchParams();
  const navigate                  = useNavigate();
  const { clearCart }             = useCart();
  const merchantOrderId           = searchParams.get("merchantOrderId");
  const [viewState, setViewState] = useState("loading"); // loading | success | failure | pending
  const [paymentData, setPaymentData] = useState(null);
  const pollCount                 = useRef(0);
  const cartCleared               = useRef(false);

  const verify = useCallback(async () => {
    if (!merchantOrderId) {
      setViewState("failure");
      return;
    }
    try {
      const res = await paymentService.verify(merchantOrderId);
      if (res.status === "SUCCESS") {
        if (!cartCleared.current) {
          cartCleared.current = true;
          clearCart().catch(() => {});
        }
        setPaymentData(res);
        setViewState("success");
      } else if (["FAILED", "CANCELLED", "AUTO_CANCELLED"].includes(res.status)) {
        setPaymentData(res);
        setViewState("failure");
      } else {
        // PENDING — keep polling
        pollCount.current += 1;
        if (pollCount.current < MAX_POLLS) {
          setTimeout(verify, POLL_INTERVAL);
        } else {
          setViewState("pending");
        }
      }
    } catch {
      pollCount.current += 1;
      if (pollCount.current < MAX_POLLS) {
        setTimeout(verify, POLL_INTERVAL);
      } else {
        setViewState("failure");
      }
    }
  }, [merchantOrderId, clearCart]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 5, pb: 6 }}>
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 2 }}>
            Payment Status
          </Typography>
        </Box>

        {viewState === "loading" && (
          <Paper
            elevation={0}
            sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 5, textAlign: "center" }}
          >
            <CircularProgress sx={{ color: brand.orange, mb: 2 }} size={48} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Verifying payment…
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Please do not close this window.
            </Typography>
          </Paper>
        )}

        {viewState === "success" && (
          <SuccessView
            merchantOrderId={merchantOrderId}
            masterOrderId={paymentData?.masterOrderId}
            amount={paymentData?.payment?.amount}
            navigate={navigate}
          />
        )}

        {viewState === "failure" && (
          <FailureView status={paymentData?.status} navigate={navigate} />
        )}

        {viewState === "pending" && <PendingView />}
      </Container>
    </AppLayout>
  );
}
