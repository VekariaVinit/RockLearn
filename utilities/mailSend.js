const nodemailer = require("nodemailer");

// Function to send mail based on different conditions
module.exports.sendMail = async function sendMail(str, data) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Gmail address from environment variable
      pass: process.env.GMAIL_PASS, // App Password from environment variable
    },
  });

  let Osubject, Ohtml;

  // console.log(data.email);

  if (str === "otp") {
    Osubject = "OTP to verify your email id with RockLearn";
    Ohtml = `
      <div class="container" style="max-width: 90%; margin: auto; padding-top: 20px">
        <h2 style="text-align:center;">Welcome to RockLearn.</h2>
        <h4>You are officially In ✔</h4>
        <p style="margin-bottom: 30px;">Please enter the sign-up OTP to get started.</p>
        <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${data.otp}</h1>
        <p style="margin-top: 15px;">OTP is valid for only 5 minutes. Please don't share the OTP with anyone.</p>
      </div>`;
  } else if (str === "forgotPassword") {
    Osubject = "OTP to reset password of your account with RockLearn";
    Ohtml = `
      <div class="container" style="max-width: 90%; margin: auto; padding-top: 20px">
        <h2 style="text-align:center;">RockLearn</h2>
        <p style="margin-bottom: 30px;">Please enter the reset password OTP to update the password.</p>
        <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${data.otp}</h1>
        <p style="margin-top: 15px;">OTP is valid for only 5 minutes. Please don't share the OTP with anyone.</p>
      </div>`;
  } else {
    throw new Error("Invalid email type specified.");
  }

  // Send mail with defined transport object
  try {
    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER, // sender address (use the sender's email)
      to: data.email, // recipient's email address
      subject: Osubject, // Subject line
      html: Ohtml, // HTML body
    });

    // console.log("Email sent successfully:", info);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};
