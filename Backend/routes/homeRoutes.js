const express = require('express');
const router = express.Router();
const { getRepoList, createLab } = require('../controllers/homepageController');
const multer = require('multer'); // Handle file uploads

const upload = multer({ dest: 'uploads/' });

// GET route for repo list and metadata
router.get('/', getRepoList);

// POST route for creating a lab
router.post('/create-lab', upload.array('folder'), createLab);

module.exports = router;
