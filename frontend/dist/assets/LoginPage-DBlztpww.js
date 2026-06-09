import { r as reactExports, u as useNavigate, j as jsxRuntimeExports, B as Box, C as CircularProgress, L as Link } from "./index-EstIw0RN.js";
import { L as Logo, T as Typography } from "./Logo-DCDhUauE.js";
import { a as authService } from "./authService-DlXx6MPf.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { T as TextField } from "./TextField-Bs3yYaqe.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import "./Select-4eHc_Vcc.js";
import "./InputBase-e5CItqOA.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
import "./useControlled-Am1rG54b.js";
import "./InputLabel-DA7QQiD4.js";
function LoginPage() {
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      const user = { ...data.user, role: data.user.role.toLowerCase() };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(user.role === "caterer" ? "/caterer" : "/customer");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Box,
    {
      sx: {
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { width: "100%", maxWidth: 420, boxShadow: 3, borderRadius: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: { xs: 3, sm: 4 } }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: 44, showTagline: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800, mb: 0.5 }, children: "Welcome Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mb: 3 }, children: "Login to continue" }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSubmit, noValidate: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2.5, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Email Address",
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              disabled: loading,
              autoComplete: "email",
              variant: "outlined"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              disabled: loading,
              autoComplete: "current-password",
              variant: "outlined"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              fullWidth: true,
              type: "submit",
              variant: "contained",
              size: "large",
              disabled: loading,
              sx: {
                py: 1.5,
                background: "linear-gradient(135deg, #E8751A 0%, #F5A05A 100%)",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: 1,
                "&:hover": { background: "linear-gradient(135deg, #D2680F 0%, #D2680F 100%)" }
              },
              children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 22, sx: { color: "white" } }) : "Login"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              fullWidth: true,
              variant: "outlined",
              size: "large",
              component: Link,
              to: "/register",
              disabled: loading,
              sx: {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: 1,
                borderColor: "#E8751A",
                color: "#E8751A",
                "&:hover": { borderColor: "#E8751A", backgroundColor: "rgba(232,117,26,0.05)" }
              },
              children: "Create Account"
            }
          )
        ] }) })
      ] }) })
    }
  );
}
export {
  LoginPage as default
};
