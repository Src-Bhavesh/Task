const express = require("express");
const route = express.Router();
const auth = require("../middleware/auth");
const isLoggedIn = require("../middleware/isLoggedIn");

const userController = require("../controllers/userController");

route.get("/", isLoggedIn, userController.home);
route.get('/register', isLoggedIn, userController.registerPage);
route.get('/login', isLoggedIn, userController.loginPage);
route.post('/register',userController.register);
route.post('/login',userController.login);
route.get('/dashboard',auth,userController.dashboard);
route.get('/profile', auth, userController.profile);
route.post('/save-movie', auth, userController.saveMovie);
route.get("/logout", userController.logout);


module.exports = route;

