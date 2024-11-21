// /routes/uploadRoute.js
const express = require('express');
const { upload, uploadLab } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// // Route for uploading labs
// router.post('/api/labs', upload.array('files'), uploadLab);
router.post('/api/labs',protect, (req, res, next) => {
    upload.array('files')(req, res, (err) => {
        if (err) {
            return res.status(500).json({ message: 'File upload failed', error: err.message });
        }

        // Log labName, tags, and selected files
        const labName = req.body.labName;
        const tags = JSON.parse(req.body.tags || '[]');
        const files = req.files;

        // Pass the data to the uploadLab controller
        uploadLab(req, res, labName, tags, files);
    });
});
router.get('/',(req,res)=>{
    res.render('upload')

})
module.exports = router;
