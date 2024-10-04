const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const authRouter = require("./routers/authRouter");
const { authMiddleware } = require("./middleware/auth-middleware");
require("dotenv").config();


const corsOptions = {
  origin: process.env.CLIENT_LINK,
  credentials: true,
};
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use(express.json());

const db_link = process.env.DB_LINK;
console.log(db_link)
mongoose
  .connect(db_link, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(function (db) {
    console.log("db is connected");
  })
  .catch(function (err) {
    console.log(err);
  });

const PORT = process.env.PORT || 3001; 

server.listen(PORT, () => {
  console.log("Listening on port `" + PORT + "`");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});


app.use("/user", authRouter);
