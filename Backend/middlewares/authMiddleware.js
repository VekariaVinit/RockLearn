// const jwt = require("jsonwebtoken");
// const userModel = require("../models/userModel");

// module.exports.authMiddleware = async (req, res, next) => {
//   try {
//     const { TOKEN } = req.cookies;
//     if (!TOKEN) {
//       return res.status(401).json({
//         message: "Please login first",
//       });
//     }
//     const { id } = jwt.verify(TOKEN, process.env.JWT_SECRET);
//     req.user = await userModel.findById(id).select("-password");
//     if (req.user) {
//       next();
//     } else {
//       return res.status(401).json({
//         message: "Not registered user",
//       });
//     }
//   } catch (err) {
//     return res.status(400).json({
//       message: "Invalid token",
//     });
//   }
// };
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports.protect = async (req, res, next) => {
  let token;
  if (req.cookies.TOKEN) {
    token = req.cookies.TOKEN;
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userModel.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Not authorized, token failed.",
    });
  }
};
