import { useState, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import razorpayService from "../services/razorpayService";
import masterOrderService from "../services/masterOrderService";

const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * Self-contained Razorpay checkout button.
 *
 * Props:
 *  - orderParams    { items, customer_lat, customer_lng, delivery_*, fulfillment_type }
 *                   Required when onVerified is NOT provided (master-order flow).
 *  - totalRupees    number — displayed total in INR (also used for Razorpay amount)
 *  - customerName   string — prefill in checkout modal
 *  - customerEmail  string
 *  - customerPhone  string
 *  - onSuccess(masterOrder) — called after PO.PU order is created (master-order flow)
 *  - onVerified(response)   — if provided, called instead of creating master order;
 *                             receives { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *  - onError(message)       — called on any failure
 *  - disabled               boolean
 *  - label                  string — optional button label override
 */
export default function RazorpayButton({
  orderParams,
  totalRupees,
  customerName  = "",
  customerEmail = "",
  customerPhone = "",
  onSuccess,
  onVerified,
  onError,
  disabled = false,
  label,
}) {
  const [scriptReady, setScriptReady] = useState(false);
  const [processing,  setProcessing]  = useState(false);

  useEffect(() => {
    razorpayService
      .loadScript()
      .then(() => setScriptReady(true))
      .catch(() => onError?.("Could not load payment gateway. Please refresh and try again."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClick() {
    if (!scriptReady || processing || disabled) return;
    if (!KEY_ID) {
      onError?.("Payment gateway is not configured. Please contact support.");
      return;
    }

    setProcessing(true);
    try {
      const amountPaise = Math.round(totalRupees * 100);
      const { order_id, amount, currency } = await razorpayService.createOrder(
        amountPaise,
        `popu_${Date.now()}`
      );

      await new Promise((resolve, reject) => {
        const options = {
          key:          KEY_ID,
          amount,
          currency,
          name:         "PO.PU",
          description:  "Food Order",
          image:        "/logo192.png",
          order_id,
          prefill: {
            name:    customerName,
            email:   customerEmail,
            contact: customerPhone,
          },
          theme: { color: "#1B5E20" },

          handler: async (response) => {
            try {
              // Verify signature on backend
              await razorpayService.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              if (onVerified) {
                // Caller handles order creation (e.g. tiffin orders)
                resolve({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                });
              } else {
                // Default: create master (food) order
                const masterOrder = await masterOrderService.createSplitOrder({
                  ...orderParams,
                  payment_method: "RAZORPAY",
                  payment_proofs: [],
                });
                resolve(masterOrder);
              }
            } catch (err) {
              reject(err);
            }
          },

          modal: {
            ondismiss: () => reject(Object.assign(new Error("Payment cancelled."), { cancelled: true })),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp) => {
          reject(new Error(resp?.error?.description || "Payment failed."));
        });
        rzp.open();
      }).then((result) => {
        if (onVerified) {
          onVerified(result);
        } else {
          onSuccess?.(result);
        }
      });
    } catch (err) {
      if (!err?.cancelled) {
        onError?.(err?.message || "Payment could not be completed. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  }

  const isLoading = !scriptReady || processing;

  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      onClick={handleClick}
      disabled={disabled || isLoading}
      startIcon={
        isLoading
          ? <CircularProgress size={18} color="inherit" />
          : <CurrencyRupeeRoundedIcon />
      }
      sx={{
        fontWeight: 700,
        py: 1.4,
        background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
        "&:hover": { background: "linear-gradient(135deg, #145214 0%, #1B5E20 100%)" },
        "&.Mui-disabled": { opacity: 0.6 },
      }}
    >
      {processing
        ? "Processing Payment…"
        : !scriptReady
        ? "Loading Payment Gateway…"
        : label || `Pay ₹${Number(totalRupees).toFixed(2)} via Razorpay`}
    </Button>
  );
}
