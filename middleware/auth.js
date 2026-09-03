
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.redirect("/login");

  try {
    req.user = jwt.verify(token, process.env.KEY); 
    next();
  } catch (error) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

module.exports = auth;