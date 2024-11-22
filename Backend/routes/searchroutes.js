// routes/metadataRoutes.js
const express = require('express');
const { searchLabs } = require('../controllers/metadataController');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
// Route to search for labs
router.get('/metadata/search',protect, searchLabs);

module.exports = router;
