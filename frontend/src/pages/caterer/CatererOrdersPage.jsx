import orderService from "../../services/orderService";
import { useEffect, useState } from "react";

export default function CatererOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await orderService.getOrders();
      setOrders(data || []);
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Caterer Orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            #{o.id} — {o.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
