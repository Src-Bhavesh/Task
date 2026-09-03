const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const PORT = process.env.PORT;

const DBConnect = require("./config/db")
const route = require("./routes/route")


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(async (req, res, next) => {
  try {
    await DBConnect();
    next();
  } catch (error) {
    res.status(500).send("Database connection failed: " + error.message);
  }
});

app.use('/', route);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
  });
}

module.exports = app;