import { r as reactExports, j as jsxRuntimeExports, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { A as AppLayout, C as CircleRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { A as AvailabilityToggle } from "./AvailabilityToggle-BRFmNg-x.js";
import { c as catererService } from "./catererService-MNSLc32N.js";
import { C as Container } from "./index-BIPustA6.js";
import { T as Typography } from "./Logo-DCDhUauE.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import "./CheckCircleRounded-CLWxVan5.js";
import "./Chip-yjaeJ34r.js";
import "./Switch-DcmvwebP.js";
import "./useFormControl-CRnBRMMH.js";
import "./useControlled-Am1rG54b.js";
function AvailabilityPage() {
  const [status, setStatus] = reactExports.useState("READY");
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  reactExports.useEffect(() => {
    catererService.getMyAvailability().then((d) => setStatus(d?.availability_status || "READY")).catch(() => setError("Failed to load availability.")).finally(() => setLoading(false));
  }, []);
  const handleChange = async (newStatus) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const d = await catererService.setMyAvailability(newStatus);
      setStatus(d.availability_status || newStatus);
      setSuccess(`Status updated to ${d.availability_status === "READY" ? "Ready For Orders" : "Not Ready"}.`);
    } catch {
      setError("Failed to update availability.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "sm", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleRoundedIcon, { sx: { color: brand.orange, fontSize: 24 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Availability" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", onClose: () => setError(""), sx: { mb: 2 }, children: error }),
    success && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", onClose: () => setSuccess(""), sx: { mb: 2 }, children: success }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AvailabilityToggle, { status, onChange: handleChange, loading: saving }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 3, p: 2, borderRadius: 2, backgroundColor: brand.orangeLight }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary", lineHeight: 1.7 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "READY" }),
      " — Customers can see your menu and place orders.",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NOT READY" }),
      " — Your menu is visible but ordering is disabled. Use this when you are closed, on a break, or at capacity."
    ] }) })
  ] }) });
}
export {
  AvailabilityPage as default
};
