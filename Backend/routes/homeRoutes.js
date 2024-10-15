const express = require('express');
const { getRepoList } = require('../controllers/homepageController');

const router = express.Router();

// Route to fetch all repository (recursive)
router.get('/', getRepoList);

module.exports = router;
