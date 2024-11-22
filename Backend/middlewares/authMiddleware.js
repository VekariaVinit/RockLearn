const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports.protect = async (req, res, next) => {
  try {
    // Check for the token in Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token provided.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user and attach it to the request object
    req.user = await userModel.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized, user does not exist.",
      });
    }

    // Proceed to the next middleware or route
    next();
  } catch (err) {
    console.error("Error in protect middleware:", err);

    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token.",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  }
};
