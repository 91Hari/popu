const express = require("express");
const router = express.Router();
const controller = require("../controllers/foodController");

router.get("/", controller.listFoods);
router.get("/:id", controller.getFoodById);

module.exports = router;
