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

      // 1. Fetch trending movies
      const trendingResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`);
      const trendingData = await trendingResponse.json();
      const trendingMovies = trendingData.results || [];

      // 2. Fetch popular movies
      const popularResponse = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`);
      const popularData = await popularResponse.json();
      const popularMovies = popularData.results || [];

      // 3. Combine the two lists together
      const allMovies = trendingMovies.concat(popularMovies);

      // 4. Send the movies to the dashboard template
      res.render("dashboard", { user: req.user, movies: allMovies });
    } catch (err) {
      console.error("TMDB Fetch error:", err);
      res.render("dashboard", { user: req.user, movies: [] });
    }
  },

  logout: (req, res) => {
    res.clearCookie("token");
    return res.redirect("/login");
  },

  profile: async (req, res) => {
    try {
      const User = require("../models/userModel");
      const userDoc = await User.findById(req.user.UserID);
      res.render("profile", { user: req.user, savedMovies: userDoc.savedMovies });
    } catch (err) {
      console.error("Profile error:", err);
      res.redirect("/dashboard");
    }
  },

  saveMovie: async (req, res) => {
    try {
      const User = require("../models/userModel");
      const { tmdbId, title, poster_path, vote_average } = req.body;
      
      const userDoc = await User.findById(req.user.UserID);
      
      // Check if movie already saved
      if (!userDoc.savedMovies.some(m => m.tmdbId === tmdbId)) {
        userDoc.savedMovies.push({ tmdbId, title, poster_path, vote_average });
        await userDoc.save();
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("Save movie error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

module.exports = userController;