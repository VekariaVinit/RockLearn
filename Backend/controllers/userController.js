const userModel = require("../models/userModel");

// Get user details
module.exports.getUserDetails = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }
    return res.status(200).json({
      message: "User details fetched successfully.",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Update user profile
module.exports.updateUserProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await userModel.findOneAndUpdate(
      { _id: req.user._id },
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }
    return res.status(200).json({
      message: "User profile updated successfully.",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Delete user account
module.exports.deleteUserAccount = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }
    return res.status(200).json({
      message: "User account deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
