
const express = require("express");
const app = express();
const http = require("http");
const path = require('path');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const mongo = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const labRoutes = require("./routes/labRoutes")
const homeRoutes = require("./routes/homeRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const searchRoutes = require('./routes/searchroutes');
const bodyParser = require('body-parser');


// const corsOptions = {
//   origin: process.env.CLIENT_LINK,
//   credentials: true,
// };
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure this path is correct

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
// app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_LINK,
  methods: 'GET,POST,PUT,DELETE', // Add other methods if needed
  credentials: true // Allow credentials if required
}));
mongo()

const PORT = process.env.PORT || 3001;

http.createServer(app).listen(PORT, () => {
  console.log("Listening on port `" + PORT + "`");
});

// Middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.redirect("/home");
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, 'temp_uploads')));

// Use the upload route
// app.use('/', uploadRoute);

// Use the routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/password", passwordRoutes);
app.use("/lab", labRoutes);
app.use("/home", homeRoutes);
app.use("/upload", uploadRoutes);
app.use('/api', searchRoutes);


