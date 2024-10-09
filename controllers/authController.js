const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utilities/mailSend");

// Signup user
module.exports.userSignUp = async (req, res) => {
  let { firstName, lastName, email, password } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }
    const userRegistered = await userModel.findOne({ email: email });
    if (userRegistered?.activated == false) {
      await userModel.deleteOne({ email: email });
    } else if (userRegistered) {
      return res.status(400).json({
        message: "User already registered",
      });
    }
    const name = `${firstName} ${lastName}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    let data = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    const otp = Math.floor(100000 + Math.random() * 900000);
    const timeToExpire = process.env.EXPIRE_OTP * 60 * 1000;
    const expires = Date.now() + timeToExpire;
    const emailData = {
      otp,
      name,
      email,
    };
    await sendMail("otp", emailData);
    const forHash = `${email}.${otp}.${expires}`;
    const hash = await bcrypt.hash(forHash, 10);
    const fullHash = `${hash}.${expires}`;
    return res.status(200).json({
      message: "Please verify your email id with sent OTP",
      email,
      fullHash,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Verify user with the sent OTP
module.exports.verifyUser = async (req, res) => {
  const { email, fullHash, otp } = req.body;
  try {
    if (!email || !fullHash || !otp) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }
    let index = fullHash.lastIndexOf(".");
    let hash = fullHash.slice(0, index);
    let expires = fullHash.slice(index + 1);
    const isExpired = expires < Date.now();
    if (isExpired) {
      return res.status(400).json({
        message: "OTP expired. Please try again.",
      });
    }
    const data = `${email}.${otp}.${expires}`;
    const isValid = await bcrypt.compare(data, hash);
    if (!isValid) {
      return res.status(400).json({
        message: "OTP is not valid.",
      });
    }
    const userRegistered = await userModel.findOne({ email: email });
    if (!userRegistered) {
      return res.status(400).json({
        message: "User not found.",
      });
    }
    await userModel.updateOne(
      { email: userRegistered.email },
      { $set: { activated: true } }
    );
    const token = jwt.sign({ id: userRegistered._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '1h',
    });
    res.cookie("TOKEN", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: "strict",
    });
    userRegistered.password = "__HIDDEN__";
    return res.status(200).json({
      message: "User verified successfully",
      data: userRegistered,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Sign in user
module.exports.userSignIn = async (req, res) => {
  let { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }
    const user = await userModel.findOne({ email: email });
    if (user.activated === false) {
      return res.status(400).json({
        message: "Please verify your email id.",
      });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1h',
      });
      res.cookie("TOKEN", token, {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      });
      user.password = "__HIDDEN__";
      return res.status(200).json({
        message: "User signed in successfully",
        user,
      });
    } else {
      return res.status(400).json({
        message: "Wrong credentials.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// Logout user
module.exports.userLogout = async (req, res) => {
  try {
    res.clearCookie("TOKEN");
    return res.status(200).json({
      message: "User logged out successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
