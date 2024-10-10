const express = require('express');
const { getAllFiles, getFileContent } = require('../controllers/labController');

const router = express.Router();

// Route to fetch all files in the repository (recursive)
router.get('/all', getAllFiles);

// Route to fetch and display specific file content
router.get('/content/*', getFileContent);

module.exports = router;
