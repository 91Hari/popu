import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import orderService from "../../services/orderService";

const CART_KEY = "popu_cart";

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse cart from storage:", err);
    return [];
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save cart to storage:", err);
  }
}

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const cart = loadCartFromStorage();
    setItems(cart || []);
  }, []);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
      0,
    );
  }, [items]);

  const updateQty = (id, newQty) => {
    const qty = Math.max(1, Math.min(99, Math.floor(Number(newQty) || 1)));
    const next = items.map((it) =>
      it.id === id ? { ...it, quantity: qty } : it,
    );
    setItems(next);
  };

  const increment = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, quantity: Math.min((it.quantity || 1) + 1, 99) }
          : it,
      ),
    );
  };

  const decrement = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, quantity: Math.max((it.quantity || 1) - 1, 1) }
          : it,
      ),
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleCheckout = async () => {
    setError("");
    if (!items || items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: items.map((it) => ({ foodId: it.id, quantity: it.quantity })),
        total: totalAmount,
      };

      if (orderService && typeof orderService.createOrder === "function") {
        await orderService.createOrder(payload);
      } else {
        // fallback: simulate delay
        await new Promise((res) => setTimeout(res, 600));
        console.warn(
          "orderService.createOrder not available — simulated checkout",
        );
      }

      // clear cart and navigate to orders
      setItems([]);
      saveCartToStorage([]);
      navigate("/customer/orders");
    } catch (err) {
      console.error("Checkout failed:", err);
      setError(err?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa", py: 4 }}>
      <Box component="div" sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#E8751A", mb: 3 }}
        >
          🧺 Your Cart
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {items.length === 0 ? (
          <Card sx={{ p: 3, textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Your cart is empty
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Add some delicious food to your cart from the menu.
              </Typography>
            </CardContent>
          </Card>
        ) : isMobile ? (
          // Mobile: stack cards
          <Stack spacing={2}>
            {items.map((it) => (
              <Card key={it.id} sx={{ p: 1 }}>
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {it.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        👨‍🍳 {it.caterer || "Caterer"}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        ₹{it.price} x {it.quantity} = ₹
                        {Number(it.price) * Number(it.quantity)}
                      </Typography>
                    </Box>

                    <Stack spacing={1} alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => decrement(it.id)}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          value={it.quantity}
                          onChange={(e) => updateQty(it.id, e.target.value)}
                          inputProps={{
                            style: { width: 48, textAlign: "center" },
                          }}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => increment(it.id)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <IconButton
                        onClick={() => removeItem(it.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Card sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">Total</Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#E8751A", fontWeight: 800 }}
                >
                  ₹{totalAmount}
                </Typography>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                startIcon={<ShoppingCartCheckoutIcon />}
                sx={{
                  mt: 2,
                  background:
                    "linear-gradient(135deg, #E8751A 0%, #F5A05A 100%)",
                  textTransform: "none",
                }}
                onClick={handleCheckout}
                disabled={loading}
              >
                Checkout
              </Button>
            </Card>
          </Stack>
        ) : (
          // Desktop / tablet: table layout
          <>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          {it.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          👨‍🍳 {it.caterer || "Caterer"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">₹{it.price}</TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                          alignItems="center"
                        >
                          <IconButton
                            size="small"
                            onClick={() => decrement(it.id)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>

                          <TextField
                            value={it.quantity}
                            onChange={(e) => updateQty(it.id, e.target.value)}
                            inputProps={{
                              style: { width: 64, textAlign: "center" },
                            }}
                            size="small"
                          />

                          <IconButton
                            size="small"
                            onClick={() => increment(it.id)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        ₹{Number(it.price) * Number(it.quantity)}
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => removeItem(it.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Total: ₹{totalAmount}</Typography>

              <Button
                variant="contained"
                startIcon={<ShoppingCartCheckoutIcon />}
                sx={{
                  background:
                    "linear-gradient(135deg, #E8751A 0%, #F5A05A 100%)",
                  textTransform: "none",
                }}
                onClick={handleCheckout}
                disabled={loading}
              >
                Checkout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
