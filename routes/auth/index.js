const route = require("express").Router();

const {
  registerUser,
  validateUserAccount,
  loginUser,
} = require("../../controller/authController");
route.post("/login", loginUser);
route.post("/register", registerUser);
route.post("/validate", validateUserAccount);
module.exports = route;
