// config/db.js
const mongoose = require("mongoose");
require("dotenv").config(); // Ensure environment variables are loaded

// MongoDB connection function
const connectDB = () => {
  const db_link = process.env.DB_LINK;
  mongoose
    .connect(db_link, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB is connected");
    })
    .catch((err) => {
      console.log("DB connection error: ", err);
    });
};

module.exports = connectDB;
