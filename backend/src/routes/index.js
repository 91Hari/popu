const express = require("express");
const router = express.Router();
const foodsRouter = require("./foods");

router.get("/", (req, res) => {
  res.json({ message: "API root" });
});

// Mount foods mock route at /foods
router.use("/foods", foodsRouter);

module.exports = router;
