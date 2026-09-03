const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return next();
  }

  try {
    jwt.verify(token, process.env.KEY || "BhaveshPandey");
    return res.redirect("/dashboard");
  } catch (error) {
    res.clearCookie("token");
    return next();
  }
};

module.exports = isLoggedIn;
