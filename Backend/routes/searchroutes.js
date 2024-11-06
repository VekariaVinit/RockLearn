// routes/metadataRoutes.js
const express = require('express');
const { searchLabs } = require('../controllers/metadataController');
const router = express.Router();

// Route to search for labs
router.get('/metadata/search', searchLabs);

module.exports = router;
