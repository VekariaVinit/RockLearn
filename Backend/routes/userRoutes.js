// routes/userRoutes.js
const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware'); // Ensure user is authenticated
const router = express.Router();

router.get('/profile', protect, getUserProfile);  // Use GET for fetching the user profile

module.exports = router;
