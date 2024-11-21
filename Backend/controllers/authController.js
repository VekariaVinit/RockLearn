const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utilities/mailSend");



// Generate JWT with 1-minute expiration
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1m", // Token expires in 1 minute
  });
};
// Set cookie to store the token
const setTokenCookie = (res, token) => {
  res.cookie("TOKEN", token, {
    expires: new Date(Date.now() + 60 * 1000), // Cookie expires in 1 minute
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production
    sameSite: "strict",
  });
};

// Signup user
module.exports.userSignUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields." });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser?.activated === false) {
      await userModel.deleteOne({ email });
    } else if (existingUser) {
      return res.status(400).json({ message: "User already registered." });
    }

    const name = `${firstName} ${lastName}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({ name, email, password: hashedPassword });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expires = Date.now() + process.env.EXPIRE_OTP * 60 * 1000;

    // Send OTP via email
    await sendMail("otp", { otp, name, email });

    const hash = await bcrypt.hash(`${email}.${otp}.${expires}`, 10);
    const fullHash = `${hash}.${expires}`;

    return res.status(200).json({
      message: "Please verify your email with the sent OTP.",
      email,
      fullHash,
    });
  } catch (error) {
    console.error("Error in userSignUp:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Verify user with OTP
module.exports.verifyUser = async (req, res) => {
  const { email, fullHash, otp } = req.body;

  try {
    if (!email || !fullHash || !otp) {
      return res.status(400).json({ message: "Please fill all the fields." });
    }

    const [hash, expires] = fullHash.split(".");
    if (Date.now() > +expires) {
      return res.status(400).json({ message: "OTP expired. Please try again." });
    }

    const isValid = await bcrypt.compare(`${email}.${otp}.${expires}`, hash);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.activated = true;
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      message: "User verified successfully.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error in verifyUser:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Sign in user
module.exports.userSignIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.activated) {
      return res.status(403).json({ message: "Please verify your email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong credentials." });
    }

    // Generate token
    const token = generateToken(user._id);
    setTokenCookie(res, token);  // Set token in cookies (optional)
    
    // Send token in response body
    return res.status(200).json({
      message: "User signed in successfully.",
      user: { id: user._id, name: user.name, email: user.email },
      token: token  // Send token to frontend
    });
  } catch (error) {
    console.error("Error in userSignIn:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


// Logout user
module.exports.userLogout = async (req, res) => {
  try {
    res.clearCookie("TOKEN", { httpOnly: true, sameSite: "strict" });
    return res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
    console.error("Error in userLogout:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
