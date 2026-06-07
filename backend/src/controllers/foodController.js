const sampleFoods = [
  {
    id: 1,
    name: "Paneer Butter Masala",
    description: "Creamy paneer curry",
    price: 220,
  },
  {
    id: 2,
    name: "Veg Biryani",
    description: "Aromatic basmati rice",
    price: 150,
  },
  {
    id: 3,
    name: "Masala Dosa",
    description: "Crispy dosa with potato masala",
    price: 90,
  },
];

function listFoods(req, res) {
  res.json(sampleFoods);
}

function getFoodById(req, res) {
  const id = Number(req.params.id);
  const food = sampleFoods.find((f) => f.id === id);
  if (!food) return res.status(404).json({ error: "Not found" });
  res.json(food);
}

module.exports = { listFoods, getFoodById };
