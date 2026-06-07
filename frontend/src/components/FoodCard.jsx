export default function FoodCard({ food = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 600 }}>{food.name || "Food name"}</div>
      <div style={{ color: "#666" }}>
        {food.description || "Short description"}
      </div>
      <div style={{ marginTop: 8, fontWeight: 700 }}>
        ₹ {food.price ?? "0.00"}
      </div>
    </div>
  );
}
