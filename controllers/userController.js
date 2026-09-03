const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const userController = {
  home: (req, res) => {
    res.render("home");
  },

  registerPage: (req, res) => {
    res.render("register");
  },

  loginPage: (req, res) => {
    res.render("login");
  },

  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const eu = await User.findOne({ email });
      if (eu) {
        return res.send("User already exists with this email.");
      }

      const hashpass = await bcrypt.hash(password, 10);

      const user = new User({
        username,
        email,
        password: hashpass
      });

      await user.save();
      return res.redirect("/login");
    } catch (error) {
      console.error(error);
      return res.status(500).send(`Registration error: ${error.message}`);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const data = await User.findOne({ email });
      if (!data) {
        return res.send("No User found with this email.");
      }

      const check = await bcrypt.compare(password, data.password);
      if (!check) {
        return res.send("Invalid Password or E-mail");
      }

      const token = jwt.sign(
        {
          UserID: data._id,
          username: data.username,
          email: data.email
        },
        process.env.KEY,
        {
          expiresIn: "30d"
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000
        
      });
      return res.redirect("/dashboard");
    } catch (error) {
      console.error(error);
      return res.status(500).send(`Login error: ${error.message}`);
    }
  },

  dashboard: async (req, res) => {
    try {
      const Movie = require("../models/movieModel");
      const movies = await Movie.find().limit(20);
      res.render("dashboard", { user: req.user, movies });
    } catch (err) {
      console.error("Dashboard error:", err);
      res.render("dashboard", { user: req.user, movies: [] });
    }
  },

  logout: (req, res) => {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

module.exports = userController;