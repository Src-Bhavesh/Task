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
      const apiKey = process.env.TMDB_API_KEY || "15fdacbd9c0aba4635686a669c55b973";
      
      // Fetch trending movies and popular movies from TMDB
      const [trendingRes, popularRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`),
        fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`)
      ]);
      
      const trendingData = await trendingRes.json();
      const popularData = await popularRes.json();
      
      // Combine them or pass them as one array. Let's pass all as movies for simplicity
      const movies = [...(trendingData.results || []), ...(popularData.results || [])];
      
      res.render("dashboard", { user: req.user, movies });
    } catch (err) {
      console.error("TMDB Fetch error:", err);
      res.render("dashboard", { user: req.user, movies: [] });
    }
  },

  logout: (req, res) => {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

module.exports = userController;