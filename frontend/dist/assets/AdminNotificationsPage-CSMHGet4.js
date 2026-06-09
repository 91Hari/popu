import { j as jsxRuntimeExports, r as reactExports, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { A as AppLayout, N as NotificationsNoneRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { e as createSvgIcon, T as Typography } from "./Logo-DCDhUauE.js";
import { a as adminService } from "./adminService-BlTauhTR.js";
import { C as Container } from "./index-BIPustA6.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { F as FormControl, S as Select } from "./Select-4eHc_Vcc.js";
import { I as InputLabel } from "./InputLabel-DA7QQiD4.js";
import { M as MenuItem } from "./MenuItem-gextyUDk.js";
import { T as TextField } from "./TextField-Bs3yYaqe.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import "./InputBase-e5CItqOA.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
import "./useControlled-Am1rG54b.js";
const SendRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m3.4 20.4 17.45-7.48c.81-.35.81-1.49 0-1.84L3.4 3.6c-.66-.29-1.39.2-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91"
}));
function AdminNotificationsPage() {
  const [title, setTitle] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [target, setTarget] = reactExports.useState("ALL");
  const [sending, setSending] = reactExports.useState(false);
  const [success, setSuccess] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return setError("Title and message are required.");
    setSending(true);
    setError("");
    setSuccess("");
    try {
      await adminService.broadcastNotification({ title: title.trim(), message: message.trim(), target_role: target });
      setSuccess(`Notification sent to ${target === "ALL" ? "all users" : target.toLowerCase() + "s"}.`);
      setTitle("");
      setMessage("");
    } catch {
      setError("Failed to send notification.");
    } finally {
      setSending(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "sm", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsNoneRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Broadcast Notification" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", onClose: () => setError(""), sx: { mb: 2 }, children: error }),
    success && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", onClose: () => setSuccess(""), sx: { mb: 2 }, children: success }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "form", onSubmit: handleSend, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Send To" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: target, onChange: (e) => setTarget(e.target.value), label: "Send To", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ALL", children: "All Users" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CUSTOMER", children: "Customers Only" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CATERER", children: "Caterers Only" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          size: "small",
          label: "Title",
          value: title,
          onChange: (e) => setTitle(e.target.value),
          sx: { mb: 2 }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          multiline: true,
          rows: 4,
          label: "Message",
          value: message,
          onChange: (e) => setMessage(e.target.value),
          sx: { mb: 2.5 }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          fullWidth: true,
          variant: "contained",
          type: "submit",
          size: "large",
          disabled: sending,
          startIcon: sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 18, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SendRoundedIcon, {}),
          sx: { fontWeight: 700 },
          children: sending ? "Sending…" : "Send Notification"
        }
      )
    ] }) }) })
  ] }) });
}
export {
  AdminNotificationsPage as default
};
