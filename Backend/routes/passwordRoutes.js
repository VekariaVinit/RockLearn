const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");
const authMiddleware = require("../middlewares/authMiddleware");
const { protect } = require('../middlewares/authMiddleware');
router.post("/change",protect, authMiddleware.protect, passwordController.changePassword);
router.post("/forgot", passwordController.forgotPassword);

module.exports = router;
