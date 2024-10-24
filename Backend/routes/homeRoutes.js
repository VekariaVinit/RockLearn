const express = require('express');
const router = express.Router();
const { getRepoList, createLab } = require('../controllers/homepageController');
const multer = require('multer'); // Handle file uploads

const upload = multer({ dest: 'uploads/' });

router.get('/', getRepoList);
// router.post('/home,')
// POST route for creating a lab
router.post('/create-lab', upload.array('folder'), createLab);

module.exports = router;
