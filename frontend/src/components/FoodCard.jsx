import { useState, useRef, useEffect } from "react";
import { Box, Button, Chip, CircularProgress, Tooltip, Typography } from "@mui/material";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CommonCard from "./CommonCard";
import { useCart } from "../contexts/CartContext";
import { brand } from "../theme";

export default function FoodCard({ food = {}, onClick }) {
  const [adding, setAdding]       = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const resetRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => () => { if (resetRef.current) clearTimeout(resetRef.current); }, []);

  const id          = food.foodId  || food.id;
  const name        = food.foodName || food.food_name || food.name || "Food Item";
  const caterer     = food.catererName || food.caterer_name || "";
  const price       = food.price;
  const isAvailable = food.available ?? food.is_available ?? true;
  const imgSrc      = food.imageUrl || food.image_url;
  const category    = food.category;
  const eta         = food.estimatedDeliveryTime;
  const etaRange    = food.etaRange;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAvailable || adding) return;
    setAdding(true);
    try {
      await addToCart(id, 1);
      setAddedCount((prev) => {
        const next = prev + 1;
        if (resetRef.current) clearTimeout(resetRef.current);
        resetRef.current = setTimeout(() => setAddedCount(0), 2000);
        return next;
      });
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
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
          ₹{price}
        </Typography>
        {category && isAvailable && (
          <Chip
            label={category}
            size="small"
            sx={{ height: 18, fontSize: "0.6rem", backgroundColor: brand.goldLight, color: brand.text }}
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

      {eta != null && isAvailable && (
        <Tooltip title={`Prep + delivery: ~${eta} min`} placement="top">
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, mt: 0.5 }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 11, color: brand.orange }} />
            <Typography variant="caption" sx={{ color: brand.orange, fontWeight: 600, fontSize: "0.65rem" }}>
              {etaRange || `${eta} mins`}
            </Typography>
          </Box>
        </Tooltip>
      )}
    </Box>
  );

  const isAdded = addedCount > 0;

  const action = (
    <Box sx={{ position: "relative", width: "100%" }}>
      {/* Floating "+1" burst on each add */}
      {isAdded && (
        <Box
          key={addedCount}
          sx={{
            position: "absolute",
            top: -22,
            right: 8,
            fontSize: "0.8rem",
            fontWeight: 900,
            color: brand.green,
            pointerEvents: "none",
            zIndex: 10,
            "@keyframes floatUp": {
              "0%":   { opacity: 1, transform: "translateY(0) scale(1.2)" },
              "60%":  { opacity: 1, transform: "translateY(-10px) scale(1)" },
              "100%": { opacity: 0, transform: "translateY(-20px) scale(0.8)" },
            },
            animation: "floatUp 0.65s ease forwards",
          }}
        >
          +1
        </Box>
      )}

      <Button
        fullWidth
        size="small"
        variant={isAdded ? "contained" : "outlined"}
        disabled={!isAvailable || adding}
        onClick={handleAddToCart}
        startIcon={
          adding ? <CircularProgress size={12} /> :
          <AddShoppingCartRoundedIcon fontSize="small" />
        }
        sx={{
          fontSize: "0.72rem",
          fontWeight: 800,
          height: 30,
          transition: "all 0.2s ease",
          ...(isAdded ? {
            backgroundColor: brand.green,
            borderColor: brand.green,
            color: "white",
            "&:hover": { backgroundColor: brand.green },
            "&:disabled": { backgroundColor: brand.green, color: "white" },
          } : {
            borderColor: brand.orange,
            color: brand.orange,
            "&:hover": { backgroundColor: brand.greenLight },
          }),
        }}
      >
        {adding ? "Adding…" : isAdded ? `+${addedCount} Added` : "Add to Cart"}
      </Button>
    </Box>
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
