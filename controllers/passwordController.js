const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendMail } = require("../utilities/mailSend");

// Change Password
module.exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    // Hash the new password and update the user record
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Forgot Password
module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist.",
      });
    }

    // Generate a reset token and hash it
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set password reset fields
    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10-minute expiration
    await user.save();

    // Send email with reset token
    const resetUrl = `${req.protocol}://${req.get("host")}/api/password/reset/${resetToken}`;
    const emailData = {
      email: user.email,
      name: user.name,
      resetUrl,
    };
    
    await sendMail("passwordReset", emailData);

    return res.status(200).json({
      message: `A password reset link has been sent to ${user.email}.`,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Reset Password
module.exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Hash the token provided by the user and find a user with matching reset token and valid expiration
    const hashedResetToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpire: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token.",
      });
    }

    // Hash the new password and save it to the user's record
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password has been reset successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
