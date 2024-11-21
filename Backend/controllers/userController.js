const User = require('../models/userModel');
const Lab = require('../models/Metadata');

const getUserProfile = async (req, res) => {
    try {
        // Fetch the user by ID, and populate both likedLabs and visitedLabs with full lab details
        const user = await User.findById(req.user.id)
            .populate({
                path: 'likedLabs',
                select: 'title description totalLikes totalVisits tags', // Select fields you need from the lab model
            })
            .populate({
                path: 'visitedLabs',
                select: 'title description totalLikes totalVisits tags', // Select fields you need from the lab model
            });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Send the user profile data, including detailed liked and visited labs
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getUserProfile };
