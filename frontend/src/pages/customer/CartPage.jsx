import { useNavigate } from "react-router-dom";
import {
  Box, Container, Toolbar, Typography, IconButton, Button,
  Stack, CircularProgress, Alert, Divider, Paper, Chip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import orderService from "../../services/orderService";
import TopNav from "../../components/TopNav";
import { brand } from "../../theme";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, total, cartCount, updateQty, removeFromCart, clearCart, loading, refresh } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!items.length) return;
    setCheckingOut(true);
    setError("");
    try {
      await orderService.createOrder({
        items: items.map((i) => ({ food_item_id: i.food_item_id, quantity: i.quantity })),
      });
      await clearCart();
      navigate("/customer/orders");
    } catch (err) {
      setError(err?.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <ShoppingCartRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Your Cart</Typography>
            {cartCount > 0 && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {cartCount} item{cartCount !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && !items.length ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : items.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 6, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 3 }}
          >
            <ShoppingCartRoundedIcon sx={{ fontSize: 64, color: brand.border, mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>Your cart is empty</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Browse food items and add them to your cart.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/services/tiffins")}>
              Browse Food
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {/* Items */}
            <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, overflow: "hidden" }}>
              {items.map((item, idx) => (
                <Box key={item.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                    {/* Food thumbnail */}
                    <Box
                      sx={{
                        width: 64, height: 64, borderRadius: 2, flexShrink: 0,
                        background: item.image_url
                          ? `url(${item.image_url}) center/cover no-repeat`
                          : `linear-gradient(135deg, ${brand.orangeLight}, #FFD0A0)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {!item.image_url && <DinnerDiningRoundedIcon sx={{ fontSize: 28, color: brand.orange, opacity: 0.7 }} />}
                    </Box>

                    {/* Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {item.food_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }} noWrap>
                        {item.caterer_name}
                      </Typography>
                      {!item.is_available && (
                        <Chip label="Unavailable" size="small" color="default" sx={{ height: 18, fontSize: "0.6rem", mt: 0.5 }} />
                      )}
                    </Box>

                    {/* Price */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange, flexShrink: 0, minWidth: 64, textAlign: "right" }}>
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </Typography>

                    {/* Qty controls */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        sx={{ width: 28, height: 28, backgroundColor: brand.orangeLight, color: brand.orange }}
                      >
                        <RemoveRoundedIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        sx={{ width: 28, height: 28, backgroundColor: brand.orange, color: "white" }}
                      >
                        <AddRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Remove */}
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      sx={{ color: "text.disabled", "&:hover": { color: "error.main" }, flexShrink: 0 }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {idx < items.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>

            {/* Summary */}
            <Paper elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Order Summary</Typography>

              <Stack spacing={0.75}>
                {items.map((item) => (
                  <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                      {item.food_name} × {item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ flexShrink: 0, ml: 1 }}>
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>
                  ₹{Number(total).toFixed(2)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={checkingOut ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartCheckoutRoundedIcon />}
                onClick={handleCheckout}
                disabled={checkingOut || !items.length}
                sx={{ fontWeight: 700, py: 1.25 }}
              >
                {checkingOut ? "Placing Order…" : "Checkout"}
              </Button>
            </Paper>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
