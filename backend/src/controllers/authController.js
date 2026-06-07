const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-prod";

// Mock user database
const users = [
  {
    id: 1,
    email: "customer@test.com",
    password: "password123",
    role: "customer",
  },
  {
    id: 2,
    email: "caterer@test.com",
    password: "password123",
    role: "caterer",
  },
];

function register(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }
  const newUser = { id: users.length + 1, email, password, role: "customer" };
  users.push(newUser);
  res
    .status(201)
    .json({ id: newUser.id, email: newUser.email, role: newUser.role });
}

function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: "7d" },
  );
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
}

module.exports = { register, login };
