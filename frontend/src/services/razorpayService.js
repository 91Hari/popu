import api from "./api";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/** Dynamically load the Razorpay checkout script (idempotent). */
function loadScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script."));
    document.body.appendChild(script);
  });
}

/** Create a Razorpay order on the backend. Returns { order_id, amount, currency }. */
async function createOrder(amountInPaise, receipt) {
  return api.request("/razorpay/create-order", {
    method: "POST",
    body: JSON.stringify({ amount_paise: amountInPaise, receipt }),
  });
}

/** Verify the Razorpay signature on the backend. Throws on invalid. */
async function verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
  return api.request("/razorpay/verify", {
    method: "POST",
    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
  });
}

export default { loadScript, createOrder, verifyPayment };
