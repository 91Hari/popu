import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import foodService from "../../services/foodService";

export default function FoodDetailsPage() {
  const { id } = useParams();
  const [food, setFood] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await foodService.getFoodById(id);
      setFood(data);
    }
    if (id) load();
  }, [id]);

  if (!food) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{food.name}</h2>
      <p>{food.description}</p>
      <div>Price: ₹ {food.price}</div>
    </div>
  );
}
