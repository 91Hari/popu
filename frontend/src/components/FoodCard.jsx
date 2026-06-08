import { useState } from "react";
import { Box, Button, Chip, CircularProgress, Tooltip, Typography } from "@mui/material";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CommonCard from "./CommonCard";
import { useCart } from "../contexts/CartContext";
import { brand } from "../theme";

export default function FoodCard({ food = {}, onClick }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);
  const { addToCart } = useCart();

  const id          = food.foodId  || food.id;
  const name        = food.foodName || food.food_name || food.name || "Food Item";
  const caterer     = food.catererName || food.caterer_name || "";
  const price       = food.price;
  const isAvailable = food.available ?? food.is_available ?? true;
  const imgSrc      = food.imageUrl || food.image_url;
  const category    = food.category;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAvailable || adding) return;
    setAdding(true);
    try {
      await addToCart(id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setAdding(false);
    }
  };

  const subtitle = caterer ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
      <StorefrontRoundedIcon sx={{ fontSize: 11, color: "text.disabled" }} />
      <span>{caterer}</span>
    </Box>
  ) : null;

  const meta = (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
        ₹{price}
      </Typography>
      {category && isAvailable && (
        <Chip
          label={category}
          size="small"
          sx={{ height: 18, fontSize: "0.6rem", backgroundColor: brand.orangeLight, color: brand.orange }}
        />
      )}
      {!isAvailable && (
        <Chip
          label="Unavailable"
          size="small"
          sx={{ height: 18, fontSize: "0.6rem", backgroundColor: "#f5f5f5", color: brand.muted }}
        />
      )}
    </Box>
  );

  const action = (
    <Button
      fullWidth
      size="small"
      variant={added ? "contained" : "outlined"}
      disabled={!isAvailable || adding}
      onClick={handleAddToCart}
      startIcon={
        adding ? <CircularProgress size={12} /> :
        added  ? <CheckRoundedIcon fontSize="small" /> :
                 <AddShoppingCartRoundedIcon fontSize="small" />
      }
      sx={{
        fontSize: "0.72rem",
        fontWeight: 700,
        height: 30,
        ...(added ? {
          backgroundColor: brand.green,
          borderColor: brand.green,
          color: "white",
          "&:hover": { backgroundColor: brand.green },
        } : {
          borderColor: brand.orange,
          color: brand.orange,
          "&:hover": { backgroundColor: brand.orangeLight },
        }),
      }}
    >
      {added ? "Added!" : "Add to Cart"}
    </Button>
  );

  return (
    <CommonCard
      imageSrc={imgSrc}
      title={name}
      subtitle={subtitle}
      meta={meta}
      action={action}
      disabled={!isAvailable}
      onClick={onClick}
    />
  );
}
