const express = require('express');
const { getAllFiles, getFileContent } = require('../controllers/labController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();


// Change this route to accept any repository name
router.get('/:repoName',protect, getAllFiles);

// Route to fetch and display specific file content
router.get('/content/:repoName/*',protect, getFileContent);

module.exports = router;
