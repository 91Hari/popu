import { useEffect, useState } from "react";
import foodService from "../../services/foodService";

export default function FoodListPage() {
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
      <h2>Your Foods</h2>
      <ul>
        {foods.map((f) => (
          <li key={f.id}>
            {f.name} — ₹{f.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
