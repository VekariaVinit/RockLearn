const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/details", authMiddleware.protect, userController.getUserDetails);
router.put("/update", authMiddleware.protect, userController.updateUserProfile);
router.delete("/delete", authMiddleware.protect, userController.deleteUserAccount);

module.exports = router;
