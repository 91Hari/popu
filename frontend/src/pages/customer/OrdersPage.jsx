import orderService from "../../services/orderService";
import { useEffect, useState } from "react";

export default function OrdersPage() {
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
      <h2>Your Orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            Order #{o.id} — {o.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
