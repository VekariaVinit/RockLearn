const express = require('express');
const { getAllFiles, getFileContent } = require('../controllers/labController');

const router = express.Router();


// Change this route to accept any repository name
router.get('/:repoName', getAllFiles);

// Route to fetch and display specific file content
router.get('/content/:repoName/*', getFileContent);

module.exports = router;
