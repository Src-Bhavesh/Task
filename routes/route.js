const express = require("express");
const route = express.Router();
const auth = require("../middleware/auth");

const userController = require("../controllers/userController");

route.get("/",userController.home);
route.get('/register',userController.registerPage);
route.get('/login',userController.loginPage);
route.post('/register',userController.register);
route.post('/login',userController.login);
route.get('/dashboard',auth,userController.dashboard);
route.get("/logout", userController.logout);


module.exports = route;

