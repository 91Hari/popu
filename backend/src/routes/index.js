const express = require("express");
const router = express.Router();
const foodsRouter = require("./foods");
const authRouter = require("./auth");

router.get("/", (req, res) => {
  res.json({ message: "API root" });
});

// Mount auth routes at /auth
router.use("/auth", authRouter);

// Mount foods mock route at /foods
router.use("/foods", foodsRouter);

module.exports = router;
