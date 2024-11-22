const express = require('express');
const router = express.Router();
const { getRepoList, createLab } = require('../controllers/homepageController');
const multer = require('multer'); // Handle file uploads
const { protect } = require('../middlewares/authMiddleware');
const upload = multer({ dest: 'uploads/' });
const Lab = require('../models/Metadata');
const User = require('../models/userModel');

// GET route for repo list and metadata
router.get('/',protect, getRepoList);

// POST route for creating a lab
router.post('/create-lab',protect, upload.array('folder'), createLab);


router.post('/:id/like', protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // User ID is now available from middleware

    try {
        // Find the lab by ID
        const lab = await Lab.findById(id);
        const user = await User.findById(userId);

        if (!lab || !user) {
            return res.status(404).json({ success: false, message: 'Lab or user not found' });
        }

        // Check if the lab is already liked by the user
        const alreadyLiked = lab.likedBy.includes(userId);

        if (alreadyLiked) {
            // If already liked, remove the user from likedBy and decrement totalLikes
            lab.likedBy.pull(userId);
            lab.totalLikes -= 1;

            // Remove the lab from user's likedLabs
            user.likedLabs.pull(lab._id);
        } else {
            // If not liked, add the user to likedBy and increment totalLikes
            lab.likedBy.push(userId);
            lab.totalLikes += 1;

            // Add the lab to the user's likedLabs
            user.likedLabs.push(lab._id);
        }

        // Save both the lab and the user
        await lab.save();
        await user.save();

        res.json({ success: true, liked: !alreadyLiked });
    } catch (error) {
        console.error('Error updating likes:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.post('/:id/visit', protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // User ID is now available from middleware

    try {
        // Find the lab by ID
        const lab = await Lab.findById(id);
        const user = await User.findById(userId);

        if (!lab) {
            return res.status(404).json({ success: false, message: 'Lab not found' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the lab has already been visited by this user
        if (!user.visitedLabs.includes(id)) {
            lab.visitedBy.push(userId);
            user.visitedLabs.push(id);
            await user.save();

            // Increment the totalVisits for the lab
            lab.totalVisits += 1;
            await lab.save();
        }

        res.json({ success: true, message: 'Lab marked as visited' });
    } catch (error) {
        console.error('Error marking lab as visited:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
