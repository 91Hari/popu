import { useEffect, useState } from "react";
import FoodCard from "../../components/FoodCard";
import foodService from "../../services/foodService";

export default function FoodSearchPage() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await foodService.getFoods();
      setFoods(data || []);
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Search Foods</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
        }}
      >
        {foods.map((f) => (
          <FoodCard key={f.id} food={f} />
        ))}
      </div>
    </div>
  );
}
