
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const mongo = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const corsOptions = {
  origin: process.env.CLIENT_LINK,
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

mongo()

const PORT = process.env.PORT || 3001;

http.createServer(app).listen(PORT, () => {
  console.log("Listening on port `" + PORT + "`");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Use the routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/password", passwordRoutes);

