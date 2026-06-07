import { useState } from "react";

export default function AddFoodPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  function submit(e) {
    e.preventDefault();
    alert("Add food: " + name + " - " + price);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Food</h2>
      <form onSubmit={submit}>
        <div>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
